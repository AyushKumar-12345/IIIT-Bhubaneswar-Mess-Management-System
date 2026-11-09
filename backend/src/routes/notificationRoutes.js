import { Router } from "express";
import { protect } from "../middleware/auth.js";
import * as ctrl from "../controllers/notificationController.js";

const router = Router();

router.get("/my", protect, ctrl.my);
router.patch("/:id/read", protect, ctrl.markRead);
router.post("/mark-all-read", protect, ctrl.markAllRead);
router.delete("/clear-read", protect, ctrl.clearRead);
router.delete("/clear-all", protect, ctrl.clearAll);
router.delete("/:id", protect, ctrl.deleteOne);

export default router;
