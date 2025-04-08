import express from "express";
import { getAssignments, getClassTeacher, getFilteredExams, getNotes, getSpecificClassTeacher, getTeacherRoutine } from "../controllers/teacherController.js";

const router = express.Router();

router.get("/classteachers", getClassTeacher);
router.post("/classteacher", getSpecificClassTeacher);
router.post("/routine", getTeacherRoutine);
router.post("/notes", getNotes);
router.post("/exams", getFilteredExams);
router.post("/assignment", getAssignments);
export default router;
