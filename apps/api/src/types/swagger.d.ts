declare module "swagger-jsdoc" {
  const swaggerJSDoc: (options: Record<string, unknown>) => Record<string, unknown>;
  export default swaggerJSDoc;
}

declare module "swagger-ui-express" {
  const swaggerUi: {
    serve: import("express").RequestHandler;
    setup: (spec: unknown) => import("express").RequestHandler;
  };

  export default swaggerUi;
}
