import express from "express";
import { 
    getStudents, 
    getNotice, 
    getClassRepresentatives, 
    getParentProfile, 
    getSpecificParentProfile, 
    getSpecificCalendar, 
    getAllCalendar,
    getFinanceReport
} from "../controllers/principleController.js";
import { getTeachers } from "../controllers/teacherController.js";

const router = express.Router();

router.get("/students", getStudents);
router.get("/teachers", getTeachers);
router.get("/notices", getNotice);
router.get("/ClassRepresentatives", getClassRepresentatives);
router.get("/parents", getParentProfile);
router.post("/parent", getSpecificParentProfile)
router.post("/calendar", getSpecificCalendar);
router.get("/calendars", getAllCalendar);
router.post("/finances", getFinanceReport);

export default router;