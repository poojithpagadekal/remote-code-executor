import express, { Application, Request, Response } from "express";
import executeRoute from "./routes/execute";
import "./queue/worker";
import cors from "cors";
import ratelimit from "express-rate-limit";
const app: Application = express();

app.use(express.json());
const limiter = ratelimit({
  windowMs: 60 * 1000,
  max: 30,
});
app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.get("/", (req: Request, res: Response) => {
  return res.json({ status: "ok", message: "Remote Code Executor is running" });
});

app.use("/api", executeRoute,limiter);

export default app;
