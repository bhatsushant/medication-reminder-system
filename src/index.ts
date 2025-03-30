import express, { Application } from "express";
import dotenv from "dotenv";

dotenv.config();

const app: Application = express();
app.use(express.json());

const PORT: number = Number(process.env.PORT) || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
