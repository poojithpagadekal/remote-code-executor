import { Request, Response, NextFunction } from "express";
import logger from "../config/logger";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (res.headersSent) {
    return next(err);
  }
  logger.error({ error: err.message, stack: err.stack }, "Unhandled error");
  res.status(500).json({ error: "Internal server error" });
}
