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

// Routes
import router from './routes/index.js'
import { errorHandler } from "./middleware/errors.js";
import { auth } from "./libs/auth.js";
import { toNodeHandler } from "better-auth/node";

app.use('/api/v1/',router)


// Better Auth 
app.all("/api/auth/*splat", toNodeHandler(auth));

// Global error handler
app.use(errorHandler)


app.listen(apiEnv.PORT, () => {
  logger.info(`API server running on PORT: ${apiEnv.PORT}`);
});
