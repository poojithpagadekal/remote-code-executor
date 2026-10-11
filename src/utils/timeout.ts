import Docker from "dockerode";

export function createTimeout(container: Docker.Container, timeoutMs: number) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let fired = false;
  const promise = new Promise<never>((_, reject) => {
    timer = setTimeout(async () => {
      fired = true;
      await container.kill().catch(() => {});
      reject(new Error("Time limit exceeded"));
    }, timeoutMs);
  });

  return { promise, cancel: () => clearTimeout(timer), timedOut: () => fired };
}
