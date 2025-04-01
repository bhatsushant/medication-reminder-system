import express from "express";
import callRoutes from "./routes/callRoutes";
import webhookRoutes from "./routes/webhookRoutes";

const app = express();
app.use(express.json());
app.use("/api", callRoutes);
app.use("/webhooks", webhookRoutes);

export default app;
