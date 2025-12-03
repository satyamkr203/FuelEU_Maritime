// src/infrastructure/server.ts
import express from "express";
import cors from "cors";
import routesController from "../adapters/inbound/http/routesController";
import complianceController from "../adapters/inbound/http/complianceController";
import bankingController from "../adapters/inbound/http/bankingController";
import poolsController from "../adapters/inbound/http/poolsController";

const app = express();
app.use(cors());
app.use(express.json());

// main routers
app.use("/routes", routesController); // GET /, POST /:routeId/baseline
app.use("/", complianceController);   // GET /routes/comparison, /compliance/*
app.use("/banking", bankingController); // /banking/...
app.use("/pools", poolsController); // /pools

app.get("/", (_req, res) => res.json({ status: "ok", service: "FuelEU-backend" }));

const PORT = Number(process.env.PORT ?? 4000);
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
}

export default app;
