import Docker from "dockerode";
import { v4 as uuidv4 } from "uuid";
import { ExecutionResult } from "../types";
import { EXECUTION_TIMEOUT_MS,MAX_MEMORY_BYTES } from "../config/constants";
import fs from "fs/promises";
import path from "path";
import { ENV } from "../config/env";

const docker = new Docker();

export async function runPython(code: string): Promise<ExecutionResult> {
  const filename = `${uuidv4()}.py`;
  const filepath = path.join(process.cwd(), "temp", filename);
  const startTime = Date.now();
  await fs.mkdir(path.join(process.cwd(), "temp"), { recursive: true });
  await fs.writeFile(filepath, code);

  try {
    const result = await runInContainer(filepath, filename);
    const status = getStatus(result.exitCode);
    return {
      ...result,
      status,
      executionTime: Date.now() - startTime,
    };
  } finally {
    await fs.unlink(filepath).catch(() => {});
  }
}

async function runInContainer(
  filepath: string,
  filename: string,
): Promise<Omit<ExecutionResult, "executionTime" | "status">> {
  const hostTempPath = ENV.HOST_TEMP_PATH || path.join(process.cwd(), "temp");
  const container = await docker.createContainer({
    Image: "python:3.11-slim",
    Cmd: ["python", `/code/${filename}`],
    HostConfig: {
      Mounts: [
        {
          Type: "bind",
          Source: path.join(hostTempPath, filename).replace(/\\/g, "/"),
          Target: `/code/${filename}`,
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
    { write: (chunk: Buffer) => (stdout += chunk.toString()) },
    { write: (chunk: Buffer) => (stderr += chunk.toString()) },
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
  if (exitCode === 0) {
    return "success";
  } else if (exitCode == -1) {
    return "timeout";
  } else {
    return "runtime_error";
  }
}
