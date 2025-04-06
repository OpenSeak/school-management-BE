import express from "express";
import { getStudents } from "../controllers/principleController.js";
import { getNotice } from "../controllers/principleController.js";
import { getTeachers } from "../controllers/teacherController.js";
import { getClassRepresentatives } from "../controllers/principleController.js";
import { getParentProfile } from "../controllers/principleController.js";
import { getSpecificParentProfile } from "../controllers/principleController.js";
import { getSpecificCalendar } from "../controllers/principleController.js";
import { getAllCalendar } from "../controllers/principleController.js";

const router = express.Router();

router.get("/students", getStudents);
router.get("/teachers", getTeachers);
router.get("/notices", getNotice);
router.get("/ClassRepresentatives", getClassRepresentatives);
router.get("/parents", getParentProfile);
router.post("/parent", getSpecificParentProfile)
router.post("/calendar", getSpecificCalendar);
router.get("/calendars", getAllCalendar);

export default router;