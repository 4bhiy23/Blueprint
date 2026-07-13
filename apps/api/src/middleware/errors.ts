import { logger } from "@repo/logger";
import { NextFunction, Request, Response } from "express";

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  logger.error(err);

  res.status(500).json({
    message: "Internal server error",
  });
}
