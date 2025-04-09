import express from "express";
import { getClassMonthlyAttendance, getStudentAttendance, getStudentPerformance, getStudentProfile, getStudentRoutine } from "../controllers/studentController.js";

const router = express.Router();

router.get("/profile", getStudentProfile);
router.post("/routine", getStudentRoutine);
router.post("/performance", getStudentPerformance);
router.post("/attendance", getStudentAttendance);
router.post("/totalattendance", getClassMonthlyAttendance);

export default router;
