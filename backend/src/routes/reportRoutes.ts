import { Router } from "express";
import { getReport, exportReportCSV, exportReportExcel } from "../controllers/reportController";
import { authenticate, requireAdmin } from "../middleware/auth";

const router = Router();

router.use(authenticate, requireAdmin);

router.get("/", getReport);
router.get("/export/csv", exportReportCSV);
router.get("/export/excel", exportReportExcel);

export default router;
