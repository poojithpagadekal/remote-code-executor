import Docker from "dockerode";
import { v4 as uuidv4 } from "uuid";
import fs from "fs/promises";
import path from "path";
import { ENV } from "../config/env";
import { ExecutionResult } from "../types";
import { EXECUTION_TIMEOUT_MS, MAX_MEMORY_BYTES } from "../config/constants";

const docker = new Docker();

export async function runCpp(
  code: string,
  stdin: string = "",
): Promise<ExecutionResult> {
  const filename = `${uuidv4()}.cpp`;
  const stdinFilename = filename.replace(".cpp", ".stdin");
  const filepath = path.join(process.cwd(), "temp", filename);
  const stdinFilepath = path.join(process.cwd(), "temp", stdinFilename);
  const startTime = Date.now();

  await fs.mkdir(path.join(process.cwd(), "temp"), { recursive: true });
  await fs.writeFile(filepath, code);
  await fs.writeFile(stdinFilepath, stdin);

  try {
    const result = await runInContainer(filename, stdinFilename);
    const status = getStatus(result.exitCode, result.stage);
    return { ...result, status, executionTime: Date.now() - startTime };
  } finally {
    await fs.unlink(filepath).catch(() => {});
    await fs.unlink(stdinFilepath).catch(() => {});
  }
}

interface RawContainerResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  stage: "compile" | "run";
}

async function runInContainer(
  filename: string,
  stdinFilename: string,
): Promise<RawContainerResult> {
  const sourceFile = `/code/${filename}`;
  const outputFile = `/code/output`;
  const stdinFile = `/code/${stdinFilename}`;
  const compileCmd = `g++ ${sourceFile} -o ${outputFile}`;
  const runCmd = `${outputFile} < ${stdinFile}`;

  const hostTempPath = ENV.HOST_TEMP_PATH || path.join(process.cwd(), "temp");

  const container = await docker.createContainer({
    Image: "gcc:latest",
    Cmd: ["sh", "-c", `${compileCmd} && ${runCmd}`],
    HostConfig: {
      Mounts: [
        {
          Type: "bind",
          Source: path.join(hostTempPath, filename).replace(/\\/g, "/"),
          Target: sourceFile,
          ReadOnly: true,
        },
        {
          Type: "bind",
          Source: path.join(hostTempPath, stdinFilename).replace(/\\/g, "/"),
          Target: stdinFile,
          ReadOnly: true,
        },
      ],
      Memory: MAX_MEMORY_BYTES,
      NetworkMode: "none",
      AutoRemove: true,
    },
    AttachStdout: true,
    AttachStderr: true,
  });

  const stream = await container.attach({
    stream: true,
    stdout: true,
    stderr: true,
  });

  let stdout = "";
  let stderr = "";

  container.modem.demuxStream(
    stream,
    {
      write: (chunk: Buffer) =>
        (stdout += Buffer.isBuffer(chunk)
          ? chunk.toString("utf8")
          : String(chunk)),
    },
    {
      write: (chunk: Buffer) =>
        (stderr += Buffer.isBuffer(chunk)
          ? chunk.toString("utf8")
          : String(chunk)),
    },
  );

  await container.start();

  try {
    const result = await Promise.race([
      container.wait(),
      withTimeout(container, EXECUTION_TIMEOUT_MS),
    ]);

    const stage = isCompileError(stderr, result.StatusCode) ? "compile" : "run";

    return {
      stdout: stdout.trim(),
      stderr: stderr.trim(),
      exitCode: result.StatusCode,
      stage,
    };
  } catch (error: any) {
    if (error.message === "Time limit exceeded") {
      return {
        stdout: stdout.trim(),
        stderr: "Time limit exceeded",
        exitCode: -1,
        stage: "run",
      };
    }
    throw error;
  }
}

function isCompileError(stderr: string, exitCode: number): boolean {
  if (exitCode === 0) return false;
  return (
    stderr.includes("error:") ||
    (stderr.includes("warning:") && stderr.includes("error:"))
  );
}

function withTimeout(
  container: Docker.Container,
  timeoutMs: number,
): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(async () => {
      await container.kill().catch(() => {});
      reject(new Error("Time limit exceeded"));
    }, timeoutMs);
  });
}

function getStatus(
  exitCode: number,
  stage: "compile" | "run",
): ExecutionResult["status"] {
  if (exitCode === -1) return "timeout";
  if (exitCode === 0) return "success";
  if (stage === "compile") return "compile_error";
  return "runtime_error";
}
