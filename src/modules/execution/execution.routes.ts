import { Router } from "express";
import { executeCode } from "./execution.controller";

const router = Router();

router.post("/execute", executeCode);

export default router;