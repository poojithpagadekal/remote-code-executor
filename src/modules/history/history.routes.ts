import { Router } from "express";
import { listExecutions, getExecutionById } from "./history.controller";

const router = Router();

router.get("/executions", listExecutions);
router.get("/executions/:id", getExecutionById);

export default router;