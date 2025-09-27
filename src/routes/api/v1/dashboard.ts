import { Router } from "express";
import { getKpis } from "../../../controllers/dashboard";

const router = Router();

router.get("/kpis", getKpis);

export default router;
