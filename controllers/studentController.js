import pool from "../config/db.js";

export const getStudentProfile = async (req, res) => {
    const client = await pool.connect();
    try {
        const student = await client.query("SELECT * FROM students WHERE id = $1", [req.user.id]);
        res.json(student.rows[0]);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        client.release();
    }
};

export const getStudentRoutine = async (req, res) => {
    const client = await pool.connect();
    try {
        const {
            className = '',
            section = '',
            timeSlot = '',
            teacherName = '',
            teacherSubject = '',
            day = ''
        } = req.body || {};

        const result = await client.query(`
            SELECT 
                sr.id,
                sr.class,
                sr.section,
                sr.day,
                sr.teacher_name,
                sr.teacher_subject,
                sr.day,
                sr.time_slot
            FROM student_routine sr
            WHERE 
                ($1 = '' OR sr.class ILIKE $1)
                AND ($2 = '' OR sr.section ILIKE $2)
                AND ($3 = '' OR sr.time_slot ILIKE $3)
                AND ($4 = '' OR sr.teacher_name ILIKE $4)
                AND ($5 = '' OR sr.teacher_subject ILIKE $5)
                AND ($6 = '' OR day ILIKE $6);
        `, [
            `%${className}%`,
            `%${section}%`,
            `%${timeSlot}%`,
            `%${teacherName}%`,
            `%${teacherSubject}%`,
            `%${day}%`
        ]);

        res.json(result.rows);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        client.release();
    }
};

export const getStudentPerformance = async (req, res) => {
    const client = await pool.connect();
    try {
        const {
            studentName = '',
            className = '',
            section = '',
            subject = '',
            examType = '',
            teacherName = ''
        } = req.body || {};

        const result = await client.query(`
            SELECT 
                sp.id,
                u.name AS student_name,
                e.class AS student_class,
                u.photo AS student_photo,
                e.section AS student_section,
                u.phone,
                e.subject,
                e.exam_type,
                tu.name AS teacher_name,
                e.exam_date,
                e.exam_duration,
                sp.marks_obtained,
                sp.total_marks
            FROM student_performance sp
            JOIN users u ON sp.student_id = u.id
            JOIN exams e ON sp.exam_id = e.id
            JOIN teachers t ON e.class = t.assigned_class AND e.section = t.assigned_section
            JOIN users tu ON t.user_id = tu.id
            WHERE 
                ($1 = '' OR u.name ILIKE $1)
                AND ($2 = '' OR e.class::TEXT ILIKE $2)
                AND ($3 = '' OR e.section ILIKE $3)
                AND ($4 = '' OR e.subject ILIKE $4)
                AND ($5 = '' OR e.exam_type ILIKE $5)
                AND ($6 = '' OR tu.name ILIKE $6);
        `, [
            `%${studentName}%`,
            `%${className}%`,
            `%${section}%`,
            `%${subject}%`,
            `%${examType}%`,
            `%${teacherName}%`
        ]);

        res.json(result.rows);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        client.release();
    }
};

