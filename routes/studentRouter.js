import express from "express";
import { createAttendance, createPerformance, getClassMonthlyAttendance, getStudentAttendance, getStudentPerformance, getStudentProfile, getStudentRoutine, insertStudentPerformance } from "../controllers/studentController.js";

const router = express.Router();

router.get("/profile", getStudentProfile);
router.post("/routine", getStudentRoutine);
router.post("/performance/all", getStudentPerformance);
router.post("/attendance", getStudentAttendance);
router.post("/totalattendance", getClassMonthlyAttendance);
router.post("/performance/create", insertStudentPerformance);
router.post("/performance/create/all", createPerformance);
router.post("/attendance/add", createAttendance);
export default router;
