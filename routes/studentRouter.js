import express from "express";
import { getStudentPerformance, getStudentProfile, getStudentRoutine } from "../controllers/studentController.js";

const router = express.Router();

router.get("/profile", getStudentProfile);
router.post("/routine", getStudentRoutine);
router.post("/performance", getStudentPerformance);

export default router;
