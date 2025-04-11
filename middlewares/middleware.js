import express from "express";
import cors from "cors";
import principleRouter from "../routes/principleRouter.js";
import teacherRouter from "../routes/teacherRouter.js";
import studentRouter from "../routes/studentRouter.js";
import adminRouter from "../routes/adminRoutes.js"
import noticeRoute from "../routes/noticeRoutes.js";
import calendarRoute from "../routes/calendarRouter.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/v1/principle", principleRouter);
app.use("/v1/teacher", teacherRouter);
app.use("/v1/student", studentRouter);
app.use("/v1/admin", adminRouter);
app.use("/v1/notices", noticeRoute);
app.use("/v1/calendar", calendarRoute);

export default app;
