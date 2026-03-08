import { Router, Request, Response } from "express";
import executionQueue from "../services/executionQueue";
import logger from "../config/logger";
const router = Router();

const SUPPORTED_LANGUAGES = ["python", "cpp", "java"];

router.post("/execute", async (req: Request, res: Response) => {
  const { language, code,stdin } = req.body;

  if (typeof language !== "string" || typeof code !== "string") {
    return res.status(400).json({
      error: "Language and code must be strings",
    });
  }

  const trimmedLanguage = language.trim();
  const trimmedCode = code.trim();
  const trimmedStdin = stdin.trim();

  if (trimmedLanguage === "" || trimmedCode === "") {
    return res.status(400).json({ error: "language and code are required" });
  }
  if (trimmedCode.length > 10000) {
    return res.status(400).json({
      error: "Max length of the code can be 10000 charecters",
    });
  }
  if (!SUPPORTED_LANGUAGES.includes(trimmedLanguage)) {
    return res
      .status(400)
      .json({ error: `Language '${trimmedLanguage}' is not supported yet` });
  }

  try {
    logger.info(
      { language: trimmedLanguage, codeLength: trimmedCode.length },
      "Execution request received",
    );
    const job = await executionQueue.add({
      language: trimmedLanguage,
      code: trimmedCode,
      stdin:trimmedStdin,
    });
    const result = await job.finished();
    res.status(200).json(result);
    logger.info(
      {
        language: trimmedLanguage,
        status: result.status,
        executionTime: result.executionTime,
      },
      "Execution completed",
    );
  } catch (error: any) {
    logger.error({ error: error.message }, "Execution failed");
    res.status(500).json({ error: error.message });
  }
});

export default router;
