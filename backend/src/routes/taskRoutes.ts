import { Router } from "express";
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/taskController";
import { authenticate, requireAdmin } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = Router();

router.use(authenticate);

router.get("/", getTasks);
router.get("/:id", getTaskById);
router.post("/", requireAdmin, upload.single("file"), createTask);
router.put("/:id", upload.single("file"), updateTask);
router.delete("/:id", requireAdmin, deleteTask);

export default router;
