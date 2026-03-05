import Docker from "dockerode";
import { v4 as uuidv4 } from "uuid";
import fs from "fs/promises";
import path from "path";

const docker = new Docker();

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTime: number;
}

export async function runPython(code: string): Promise<ExecutionResult> {
  const filename = `${uuidv4()}.py`;
  const filepath = path.join(process.cwd(), "temp", filename);
  const startTime = Date.now();

  await fs.writeFile(filepath, code);

  try {
    const result = await runInContainer(filepath, filename);
    return {
      ...result,
      executionTime: Date.now() - startTime,
    };
  } finally {
    await fs.unlink(filepath).catch(() => {});
  }
}

async function runInContainer(
  filepath: string,
  filename: string,
): Promise<Omit<ExecutionResult, "executionTime">> {
  const container = await docker.createContainer({
    Image: "python:3.11-slim",
    Cmd: ["python", `/code/${filename}`],
    HostConfig: {
      Mounts: [
        {
          Type: "bind",
          Source: filepath.replace(/\\/g, "/"),
          Target: `/code/${filename}`,
          ReadOnly: true,
        },
      ],
      Memory: 128 * 1024 * 1024,
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
  const result = await container.wait();

  return {
    stdout: stdout.trim(),
    stderr: stderr.trim(),
    exitCode: result.StatusCode,
  };
}
