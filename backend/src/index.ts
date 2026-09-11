import express from "express";
import cors from "cors";

import { PORT } from "./config/env";
import { notFound } from "./middleware/notFound.middleware";
import { errorHandler } from "./middleware/error.middleware";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Fundstrom ERP API is running",
    timestamp: new Date().toISOString(),
  });
});

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});