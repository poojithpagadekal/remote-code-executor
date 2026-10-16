import { Request, Response, NextFunction } from "express";
import logger from "../config/logger";
import { QueueFullError } from "../modules/execution/execution.queue";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (res.headersSent) {
    return next(err);
  }
  if (err instanceof QueueFullError) {
    res
      .status(503)
      .set("Retry-After", "5")
      .json({ error: "The servers are busy, please try again shortly" });
    return;
  }
  logger.error({ error: err.message, stack: err.stack }, "Unhandled error");
  res.status(500).json({ error: "Internal server error" });
}
