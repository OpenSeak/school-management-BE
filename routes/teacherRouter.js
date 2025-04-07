import express from "express";
import { getClassTeacher, getSpecificClassTeacher } from "../controllers/teacherController.js";

const router = express.Router();

router.get("/classteachers", getClassTeacher);
router.post("/classteacher", getSpecificClassTeacher);

export default router;
