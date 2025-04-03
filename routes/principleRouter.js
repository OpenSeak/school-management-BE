import express from "express";
import { getStudents } from "../controllers/principleController.js";

const router = express.Router();

router.get("/student", getStudents);

export default router;