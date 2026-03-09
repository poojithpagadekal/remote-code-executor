import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import executionQueue from "./execution.queue";
import { saveExecution } from "../history/history.service";
import logger from "../../config/logger";
import {
  SUPPORTED_LANGUAGES,
  MAX_CODE_LENGTH,
  MAX_TEST_CASES,
} from "../../config/constants";
import { runTestCases } from "./execution.service";
import { TestCase } from "./execution.types";

export async function executeCode(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { language, code, stdin } = req.body;

    if (!language || typeof language !== "string") {
      res.status(400).json({ error: "Language is required" });
      return;
    }

    if (!code || typeof code !== "string") {
      res.status(400).json({ error: "Code is required" });
      return;
    }

    const trimmedLanguage = language.trim().toLowerCase();
    const trimmedCode = code.trim();
    const trimmedStdin = typeof stdin === "string" ? stdin : "";

    if (!SUPPORTED_LANGUAGES.includes(trimmedLanguage)) {
      res
        .status(400)
        .json({ error: `Language ${trimmedLanguage} is not supported` });
      return;
    }

    if (trimmedCode.length === 0) {
      res.status(400).json({ error: "Code cannot be empty" });
      return;
    }

    if (trimmedCode.length > MAX_CODE_LENGTH) {
      res
        .status(400)
        .json({ error: `Code cannot exceed ${MAX_CODE_LENGTH} characters` });
      return;
    }

    logger.info(
      { language: trimmedLanguage, codeLength: trimmedCode.length },
      "Execution request received",
    );

    const job = await executionQueue.add({
      language: trimmedLanguage,
      code: trimmedCode,
      stdin: trimmedStdin,
    });
    const result = await job.finished();

    const id = uuidv4();
    await saveExecution({
      id,
      language: trimmedLanguage,
      code: trimmedCode,
      stdin: trimmedStdin,
      stdout: result.stdout,
      stderr: result.stderr,
      status: result.status,
      exitCode: result.exitCode,
      executionTime: result.executionTime,
      createdAt: new Date().toISOString(),
    });

    logger.info(
      {
        language: trimmedLanguage,
        status: result.status,
        executionTime: result.executionTime,
      },
      "Execution completed",
    );

    res.json({ id, ...result });
  } catch (error) {
    next(error);
  }
}

export async function testCode(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { language, code, testCases } = req.body;

    if (!language || typeof language !== "string") {
      res.status(400).json({ error: "Language is required" });
      return;
    }

    if (!code || typeof code !== "string") {
      res.status(400).json({ error: "Code is required" });
      return;
    }

    const trimmedLanguage = language.trim().toLowerCase();
    const trimmedCode = code.trim();

    if (!SUPPORTED_LANGUAGES.includes(trimmedLanguage)) {
      res.status(400).json({ error: "Language not supported" });
    }

    if (trimmedCode.length === 0) {
      res.status(400).json({ error: "Code cannot be empty" });
      return;
    }

    if (trimmedCode.length > MAX_CODE_LENGTH) {
      res
        .status(400)
        .json({ error: `Code cannot exceed ${MAX_CODE_LENGTH} charecters` });
      return;
    }

    if (!Array.isArray(testCases) || testCases.length === 0) {
      res.status(400).json({ error: "testCases must be a non empty array" });
      return;
    }

    if (testCases.length > MAX_TEST_CASES) {
      res
        .status(400)
        .json({ error: `Cannot exceed ${MAX_TEST_CASES} testcases` });
      return;
    }

    for (const tc of testCases) {
      if (typeof tc.input !== "string" || typeof tc.expected !== "string") {
        res.status(400).json({
          error: "Each test case must have input and expected strings",
        });
        return;
      }
    }

    logger.info({ language: trimmedCode, testCaseCount: testCases.length });
    const result = await runTestCases(
      trimmedLanguage,
      trimmedCode,
      testCases as TestCase[],
    );
    logger.info(
      { language: trimmedLanguage, passed: result.passed, total: result.total },
      "Test run completed",
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
}
