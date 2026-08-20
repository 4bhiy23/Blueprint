import { createHash } from "node:crypto";
import type { Request } from "express";

export function getRequestIpFingerprint(req: Request) {
  const ipAddress = req.ip ?? req.socket.remoteAddress ?? "unknown";

  return createHash("sha256").update(ipAddress).digest("hex");
}
