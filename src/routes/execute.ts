import { Router, Request, Response } from "express";
import { executeCode } from "../executor/index";

const router = Router();

router.post("/execute", async (req: Request, res: Response) => {
  const { language, code } = req.body;

  if (!language || !code) {
    res.status(400).json({ error: "language and code are required" });
    return;
  }

  if (language !== "python") {
    res
      .status(400)
      .json({ error: `Language '${language}' is not supported yet` });
    return;
  }

  try {
    const result = await executeCode(language, code);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
