import express from "express";
import cors from "cors";
import principleRouter from "../routes/principleRouter.js";
import teacherRouter from "../routes/teacherRouter.js";
import studentRouter from "../routes/studentRouter.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/v1/principle", principleRouter);
app.use("/v1/teacher", teacherRouter);
app.use("/v1/student", studentRouter);

export default app;
