import { Request, Response, NextFunction } from "express";
import { getExecution, getExecutions } from "./history.service";
import logger from "../../config/logger";

export async function listExecutions(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const records = await getExecutions();
    logger.info({ count: records.length }, "Fetched execution history");
    res.json(records);
  } catch (error) {
    next(error);
  }
}

export async function getExecutionById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const record = await getExecution(req.params.id as string);
    if (!record) {
      res.status(404).json({ error: "Execution not found" });
      return;
    }
    res.json(record);
  } catch (error) {
    next(error);
  }
}
