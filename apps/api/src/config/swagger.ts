import path from "node:path";
import swaggerJSDoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Blueprint API",
      version: "2.0.0",
      description: "Forms builder API for the Blueprint monorepo.",
    },
    servers: [
      {
        url: "/api/v2",
        description: "Primary API",
      },
    ],
  },
  apis: [path.resolve("src/docs/openapi.ts")],
});
