import express from "express";
import { addStudent, addTeacher } from "../controllers/adminController.js";

const router = express.Router();

router.post("/student",addStudent);
router.post("/teacher", addTeacher);

export default router;