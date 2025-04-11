import express from "express";
import { getAssignments, getClassTeacher, getFilteredExams, getSpecificClassTeacher, getTeacherRoutine } from "../controllers/teacherController.js";

const router = express.Router();

router.get("/classteachers", getClassTeacher);
router.post("/classteacher", getSpecificClassTeacher);
router.post("/routine", getTeacherRoutine);
router.post("/exams", getFilteredExams);
router.post("/assignment", getAssignments);
export default router;
