import { Router } from "express";
import { getNotifications, markNotificationRead } from "../controllers/notificationController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/", getNotifications);
router.put("/:id/read", markNotificationRead);

export default router;
