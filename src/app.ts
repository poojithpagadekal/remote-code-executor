import express, { Application, Request, Response } from "express";
import cors from "cors";
import ratelimit from "express-rate-limit";
import { errorHandler } from "./middleware/errorHandler";
import "./modules/execution/execution.worker";
import executeRoute from "./modules/execution/execution.routes";
import historyRoute from "./modules/history/history.routes";

const app: Application = express();

const limiter = ratelimit({ windowMs: 60 * 1000, max: 30 });

app.use(limiter);
app.use(express.json());
app.use(cors({ origin: "http://localhost:5174" }));

app.get("/", (req: Request, res: Response) => {
  res.json({ status: "ok", message: "Remote Code Executor is running" });
});

app.use("/api", executeRoute);
app.use("/api", historyRoute);
app.use(errorHandler);

export default app;
