import path from "node:path";
import swaggerJSDoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Blueprint API",
      version: "1.0.0",
      description: "Forms builder API for the Blueprint monorepo.",
    },
    servers: [
      {
        url: "/api/v1",
        description: "Primary API",
      },
    ],
  },
  apis: [path.resolve("src/docs/openapi.ts")],
});
