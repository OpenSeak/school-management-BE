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

export const getStudentAttendance = async (req, res) => {
    const client = await pool.connect();
    try {
        const {
            studentName = '',
            className = '',
            section = '',
            date = '',
            status = '',
            month = ''
        } = req.body || {};

        const monthNames = {
            January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
            July: 7, August: 8, September: 9, October: 10, November: 11, December: 12
        };

        const monthNumber = monthNames[month] || null;

        const query = `
            SELECT 
                u.name AS student_name,
                s.class,
                s.section,
                tu.name AS class_teacher,
                a.date,
                a.status
            FROM attendance a
            JOIN students s ON a.student_id = s.id
            JOIN users u ON s.user_id = u.id
            JOIN teachers t ON a.teacher_id = t.id
            JOIN users tu ON t.user_id = tu.id
            WHERE 
                ($1 = '' OR u.name ILIKE $1)
                AND ($2 = '' OR s.class::TEXT ILIKE $2)
                AND ($3 = '' OR s.section ILIKE $3)
                AND ($4 = '' OR a.date::TEXT ILIKE $4)
                AND ($5 = '' OR a.status ILIKE $5)
                AND ($6::INT IS NULL OR EXTRACT(MONTH FROM a.date) = $6::INT)
        `;

        const values = [
            `%${studentName}%`,
            `%${className}%`,
            `%${section}%`,
            `%${date}%`,
            `%${status}%`,
            monthNumber
        ];

        const result = await client.query(query, values);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        client.release();
    }
};

export const getClassMonthlyAttendance = async (req, res) => {
    const client = await pool.connect();
    try {
        const {
            className = '',
            section = ''
        } = req.body || {};

        const query = `
            SELECT 
                s.class,
                s.section,
                COUNT(*) FILTER (WHERE a.status = 'Present') AS total_present,
                (
                    CASE EXTRACT(MONTH FROM a.date)
                        WHEN 1 THEN 31
                        WHEN 2 THEN 
                            CASE 
                                WHEN EXTRACT(YEAR FROM a.date)::INT % 4 = 0 AND 
                                     (EXTRACT(YEAR FROM a.date)::INT % 100 != 0 OR EXTRACT(YEAR FROM a.date)::INT % 400 = 0)
                                THEN 29
                                ELSE 28
                            END
                        WHEN 3 THEN 31
                        WHEN 4 THEN 30
                        WHEN 5 THEN 31
                        WHEN 6 THEN 30
                        WHEN 7 THEN 31
                        WHEN 8 THEN 31
                        WHEN 9 THEN 30
                        WHEN 10 THEN 31
                        WHEN 11 THEN 30
                        WHEN 12 THEN 31
                    END
                ) AS monthly_total
            FROM attendance a
            JOIN students s ON a.student_id = s.id
            WHERE 
                ($1 = '' OR s.class::TEXT ILIKE $1)
                OR ($2 = '' OR s.section ILIKE $2)
            GROUP BY s.class, s.section, EXTRACT(MONTH FROM a.date), EXTRACT(YEAR FROM a.date)
            ORDER BY s.class, s.section;
        `;

        const result = await client.query(query, [
            `%${className}%`,
            `%${section}%`
        ]);

        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching class monthly attendance:", error);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        client.release();
    }
};
