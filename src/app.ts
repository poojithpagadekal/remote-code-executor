import express, { Application, Request, Response } from "express";
import executeRoute from "./routes/execute";
const app: Application = express();

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  return res.json({ status: "ok", message: "Remote Code Executor is running" });
});

app.use("/api", executeRoute);

export default app;
