import Docker from "dockerode";
import { v4 as uuidv4 } from "uuid";
import fs from "fs/promises";
import path from "path";
import { ENV } from "../config/env";
import { ExecutionResult } from "../types";
import { EXECUTION_TIMEOUT_MS, MAX_MEMORY_BYTES } from "../config/constants";

const docker = new Docker();

export async function runJava(
  code: string,
  stdin: string = "",
): Promise<ExecutionResult> {
  const dirId = uuidv4();
  const dirpath = path.join(process.cwd(), "temp", dirId);
  const filepath = path.join(dirpath, "Main.java");
  const stdinFilepath = path.join(dirpath, "stdin.txt");
  const startTime = Date.now();

  await fs.mkdir(dirpath);
  await fs.writeFile(filepath, code);
  await fs.writeFile(stdinFilepath, stdin);

  try {
    const result = await runInContainer(dirId);
    const status = getStatus(result.exitCode, result.stage);
    return { ...result, status, executionTime: Date.now() - startTime };
  } finally {
    await new Promise((resolve) => setTimeout(resolve, 500));
    await fs.rm(dirpath, { recursive: true, force: true });
  }
}

interface RawContainerResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  stage: "compile" | "run";
}

async function runInContainer(dirId: string): Promise<RawContainerResult> {
  const sourceFile = "/code/Main.java";
  const classPath = "/code";
  const className = "Main";
  const stdinFile = "/code/stdin.txt";

  const compileCmd = `javac ${sourceFile}`;
  const runCmd = `java -cp ${classPath} ${className} < ${stdinFile}`;

  const hostTempPath = ENV.HOST_TEMP_PATH || path.join(process.cwd(), "temp");
  const sourcePath = `${hostTempPath}/${dirId}`;

  const container = await docker.createContainer({
    Image: "eclipse-temurin:21-jdk-jammy",
    Cmd: ["sh", "-c", `${compileCmd} && ${runCmd}`],
    HostConfig: {
      Mounts: [
        {
          Type: "bind",
          Source: sourcePath,
          Target: "/code",
          ReadOnly: false,
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

function isCompileError(stderr: string, StatusCode: number): boolean {
  if (StatusCode === 0) return false;
  return (
    stderr.includes("error") ||
    (stderr.includes("warning") && stderr.includes("error"))
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
