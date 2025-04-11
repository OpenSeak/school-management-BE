import express from "express";
import { 
    getClassRepresentatives, 
    getParentProfile, 
    getSpecificParentProfile,
    getFinanceReport,
    getStudents
} from "../controllers/principleController.js";
import { getTeachers } from "../controllers/teacherController.js";

const router = express.Router();

router.post("/students", getStudents);
router.get("/teachers", getTeachers);
router.get("/ClassRepresentatives", getClassRepresentatives);
router.get("/parents", getParentProfile);
router.post("/parent", getSpecificParentProfile);
router.post("/finances", getFinanceReport);

export default router;