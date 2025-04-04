import express from "express";
import { getStudents } from "../controllers/principleController.js";
import { getNotice } from "../controllers/principleController.js";
import { getTeachers } from "../controllers/teacherController.js";
import { getClassRepresentatives } from "../controllers/principleController.js";

const router = express.Router();

router.get("/student", getStudents);
router.get("/teacher", getTeachers);
router.get("/notice", getNotice);
router.get("/ClassRepresentatives", getClassRepresentatives);

export default router;