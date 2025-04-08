import express from "express";
import { getStudentProfile, getStudentRoutine } from "../controllers/studentController.js";

const router = express.Router();

router.get("/profile", getStudentProfile);
router.post("/routine", getStudentRoutine);

export default router;
