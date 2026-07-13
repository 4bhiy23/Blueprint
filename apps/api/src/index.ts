import "dotenv/config";

import express from "express";
import pinoHttp from "pino-http";
import { logger } from "@repo/logger";
import { apiEnv } from "@repo/env";

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

// Routes
import router from './routes/index.js'
import { errorHandler } from "./middleware/errors.js";
app.use('/api/v1/',router)




// Global error handler
app.use(errorHandler)


app.listen(apiEnv.PORT, () => {
  logger.info(`API server running on PORT: ${apiEnv.PORT}`);
});
