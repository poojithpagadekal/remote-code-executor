import { Router, Request, Response } from "express";
import { executeCode } from "../executor/index";

const router = Router();

router.post("/execute", async (req: Request, res: Response) => {
  const { language, code } = req.body;

  if (typeof language !== "string" || typeof code !== "string") {
    return res.status(400).json({
      error: "Language and code must be strings",
    });
  }

  const trimmedLanguage = language.trim();
  const trimmedCode = code.trim();

  if (trimmedLanguage === "" || trimmedCode === "") {
    return res.status(400).json({ error: "language and code are required" });
  }
  if (trimmedCode.length > 10000) {
    return res.status(400).json({
      error: "Max length of the code can be 10000 charecters",
    });
  }
  if (trimmedLanguage !== "python") {
    return res
      .status(400)
      .json({ error: `Language '${language}' is not supported yet` });
  }

  try {
    const result = await executeCode(trimmedLanguage, trimmedCode);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
