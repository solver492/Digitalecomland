import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { supabaseAdmin } from "../lib/supabase";

const router: IRouter = Router();

router.get("/healthz", async (_req, res) => {
  if (!supabaseAdmin) {
    res.status(503).json(HealthCheckResponse.parse({ status: "database_unconfigured" }));
    return;
  }
  const { error } = await supabaseAdmin.from("products").select("id", { head: true, count: "exact" });
  const data = HealthCheckResponse.parse({ status: error ? "database_unavailable" : "ok" });
  res.status(error ? 503 : 200).json(data);
});

export default router;
