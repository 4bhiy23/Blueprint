import "dotenv/config";

import express from "express";
import pinoHttp from "pino-http";
import { logger } from "@repo/logger";
import { apiEnv } from "@repo/env";
import cors from 'cors'

const app = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          method: req.method,
          url: req.url,
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(
  cors({
    origin: apiEnv.FRONTEND_URL,
    credentials: true,
  }),
);

app.use(express.json());

// Routes
import router from './routes/index.js'
import { errorHandler } from "./middleware/errors.js";
import { auth } from "./libs/auth.js";
import { toNodeHandler } from "better-auth/node";

// Better Auth 
app.all("/api/auth/*splat", toNodeHandler(auth));

app.use("/api/v1", router);


// Global error handler
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

app.use(errorHandler);


app.listen(apiEnv.PORT, () => {
  logger.info(`API server running on PORT: ${apiEnv.PORT}`);
});
