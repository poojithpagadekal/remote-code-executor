import Docker from "dockerode";
import { v4 as uuidv4 } from "uuid";
import { ExecutionResult } from "../../types";
import { EXECUTION_TIMEOUT_MS, MAX_MEMORY_BYTES } from "../../config/constants";
import fs from "fs/promises";
import path from "path";
import { ENV } from "../../config/env";

const docker = new Docker();

export async function runPython(
  code: string,
  stdin: string = "",
): Promise<ExecutionResult> {
  const filename = `${uuidv4()}.py`;
  const stdinFilename = filename.replace(".py", ".stdin");
  const filepath = path.join(process.cwd(), "temp", filename);
  const stdinFilepath = path.join(process.cwd(), "temp", stdinFilename);
  const startTime = Date.now();

  await fs.mkdir(path.join(process.cwd(), "temp"), { recursive: true });
  await fs.writeFile(filepath, code);
  await fs.writeFile(stdinFilepath, stdin);

  try {
    const result = await runInContainer(filename, stdinFilename);
    const status = getStatus(result.exitCode);
    return { ...result, status, executionTime: Date.now() - startTime };
  } finally {
    await fs.unlink(filepath).catch(() => {});
    await fs.unlink(stdinFilepath).catch(() => {});
  }
}

async function runInContainer(
  filename: string,
  stdinFilename: string,
): Promise<Omit<ExecutionResult, "executionTime" | "status">> {
  const hostTempPath = ENV.HOST_TEMP_PATH || path.join(process.cwd(), "temp");

  const container = await docker.createContainer({
    Image: "python:3.11-slim",
    Cmd: ["sh", "-c", `python /code/${filename} < /code/${stdinFilename}`],
    HostConfig: {
      Mounts: [
        {
          Type: "bind",
          Source: path.join(hostTempPath, filename).replace(/\\/g, "/"),
          Target: `/code/${filename}`,
          ReadOnly: true,
        },
        {
          Type: "bind",
          Source: path.join(hostTempPath, stdinFilename).replace(/\\/g, "/"),
          Target: `/code/${stdinFilename}`,
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

    return {
      stdout: stdout.trim(),
      stderr: stderr.trim(),
      exitCode: result.StatusCode,
    };
  } catch (err: any) {
    if (err.message === "Time limit exceeded") {
      return {
        stdout: stdout.trim(),
        stderr: "Time limit exceeded",
        exitCode: -1,
      };
    }
    throw err;
  }
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

function getStatus(exitCode: number): "success" | "runtime_error" | "timeout" {
  if (exitCode === 0) return "success";
  if (exitCode === -1) return "timeout";
  return "runtime_error";
}
