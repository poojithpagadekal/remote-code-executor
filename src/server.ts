import express, { Application, Request, Response } from "express";
import executeRoute from "./routes/execute";
const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    message: "Remote Code Executor is running",
  });
});

(app.use("/api", executeRoute),
  app.listen(PORT, () => {
    console.log(`Server is running of ${PORT}`);
  }));

export default app;
