import express from "express";
import bodyParser from "body-parser";
import webhookRoutes from "./routes/webhookRoutes";
import callRoutes from "./routes/callRoutes";
import logger from "./config/logger";

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api", callRoutes);
app.use("/", webhookRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    logger.error("Application error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
);

export default app;
