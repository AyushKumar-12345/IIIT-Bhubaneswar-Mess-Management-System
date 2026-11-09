import { Router } from "express";
import { protect, authorize } from "../middleware/auth.js";
import * as ctrl from "../controllers/wastageController.js";

const router = Router();

router.use(protect);

// Staff - their own records
router.get("/my", authorize("staff", "mess_committee", "admin"), ctrl.mine);

// Admin/warden - all records
router.get("/stats", authorize("mess_committee", "admin"), ctrl.stats);
router.get("/", authorize("staff", "mess_committee", "admin"), ctrl.list);

// Staff & admin can create
router.post("/", authorize("staff", "mess_committee", "admin"), ctrl.create);

export default router;