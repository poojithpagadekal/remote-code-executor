import { Router } from "express";
import { executeCode, testCode } from "./execution.controller";

const router = Router();

router.post("/execute", executeCode);
router.post("/execute/test",testCode);

export default router;