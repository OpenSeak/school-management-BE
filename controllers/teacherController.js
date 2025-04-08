import pool from "../config/db.js";

export const getTeachers = async (req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query("SELECT * FROM users WHERE role = 'teacher'");
        res.json(result.rows);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error});
    } finally {
        client.release();
    }
};

export const getClassTeacher = async (req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query(`SELECT 
        t.id AS teacher_id,
        u1.name AS teacher_name,
        u1.photo AS teacher_photo,
        ct.class,
        ct.section,
    
        u2.name AS cr1_name,
        u2.phone AS cr1_phone,
        u2.photo AS cr1_photo,
    
        u3.name AS cr2_name,
        u3.phone AS cr2_phone,
        u3.photo AS cr2_photo
    
    FROM class_teachers ct
    JOIN teachers t ON ct.teacher_id = t.id
    JOIN users u1 ON t.user_id = u1.id
    
    LEFT JOIN students s1 ON ct.class_representative_student_id = s1.id
    LEFT JOIN users u2 ON s1.user_id = u2.id
    
    LEFT JOIN students s2 ON ct.second_class_representative_student_id = s2.id
    LEFT JOIN users u3 ON s2.user_id = u3.id
    
    ORDER BY ct.class, ct.section;    
        `);
        res.json(result.rows);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error});
    } finally {
        client.release();
    }
};

export const getSpecificClassTeacher = async (req, res) => {
    const client = await pool.connect();
    try {
        const { teacherName = '', className = '', section = '', crName = '' } = req.body;

        let whereClauses = [];
        let values = [];
        let index = 1;

        if (teacherName) {
            whereClauses.push(`u1.name ILIKE $${index++}`);
            values.push(`%${teacherName}%`);
        }
        if (className) {
            whereClauses.push(`ct.class ILIKE $${index++}`);
            values.push(`%${className}%`);
        }
        if (section) {
            whereClauses.push(`ct.section ILIKE $${index++}`);
            values.push(`%${section}%`);
        }
        if (crName) {
            whereClauses.push(`(u2.name ILIKE $${index} OR u3.name ILIKE $${index})`);
            values.push(`%${crName}%`);
            index++;
        }

        const whereQuery = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

        const query = `
            SELECT 
                t.id AS teacher_id,
                u1.name AS teacher_name,
                u1.photo AS teacher_photo,
                ct.class,
                ct.section,

                u2.name AS cr1_name,
                u2.phone AS cr1_phone,
                u2.photo AS cr1_photo,

                u3.name AS cr2_name,
                u3.phone AS cr2_phone,
                u3.photo AS cr2_photo

            FROM class_teachers ct
            JOIN teachers t ON ct.teacher_id = t.id
            JOIN users u1 ON t.user_id = u1.id

            LEFT JOIN students s1 ON ct.class_representative_student_id = s1.id
            LEFT JOIN users u2 ON s1.user_id = u2.id

            LEFT JOIN students s2 ON ct.second_class_representative_student_id = s2.id
            LEFT JOIN users u3 ON s2.user_id = u3.id

            ${whereQuery}
            ORDER BY ct.class, ct.section;
        `;

        const result = await client.query(query, values);
        res.json(result.rows);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    } finally {
        client.release();
    }
};

export const getTeacherRoutine = async (req, res) => {
    const client = await pool.connect();
    try {
        const {
            teacherName = '',
            className = '',
            section = '',
            day = '',
            timeSlot = ''
        } = req.body || {}; 

        const result = await client.query(`
            SELECT 
                tr.id,
                u.name AS teacher_name,
                t.specialised_subject AS teacher_subject,
                tr.day,
                tr.class,
                tr.section,
                tr.time_slot
            FROM teacher_routine tr
            JOIN teachers t ON tr.teacher_id = t.id
            JOIN users u ON t.user_id = u.id
            WHERE 
                ($1 = '' OR u.name ILIKE $1)
                AND ($2 = '' OR tr.class ILIKE $2)
                AND ($3 = '' OR tr.section ILIKE $3)
                AND ($4 = '' OR tr.day ILIKE $4)
                AND ($5 = '' OR tr.time_slot ILIKE $5);
        `, [
            `%${teacherName}%`,
            `%${className}%`,
            `%${section}%`,
            `%${day}%`,
            `%${timeSlot}%`
        ]);

        res.json(result.rows);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    } finally {
        client.release();
    }
};

export const getNotes = async (req, res) => {
    const client = await pool.connect();
    try {
        const {
            title = '',
            givenBy = '',
            uploadedBy = '',
            className = '',
            section = '',
            subject = ''
        } = req.body || {};

        const result = await client.query(`
            SELECT
                n.title,
                n.content AS given_by,
                u.name AS uploaded_by,
                n.class,
                n.section,
                n.subject,
                n.files,
                COALESCE(n.created_at::date, CURRENT_DATE) AS date
            FROM notes n
            JOIN users u ON n.created_by = u.id
            WHERE 
                ($1 = '' OR n.title ILIKE $1) AND
                ($2 = '' OR n.content ILIKE $2) AND
                ($3 = '' OR u.name ILIKE $3) AND
                ($4 = '' OR n.class ILIKE $4) AND
                ($5 = '' OR n.section ILIKE $5) AND
                ($6 = '' OR n.subject ILIKE $6)
        `, [
            `%${title}%`,
            `%${givenBy}%`,
            `%${uploadedBy}%`,
            `%${className}%`,
            `%${section}%`,
            `%${subject}%`
        ]);

        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching filtered notes:", error);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        client.release();
    }
};

export const getFilteredExams = async (req, res) => {
    const client = await pool.connect();
    try {
        const {
            className = '',
            section = '',
            examDate = '',
            subject = '',
            examDuration = '',
            examType = ''
        } = req.body || {};

        const result = await client.query(`
            SELECT
                id,
                class,
                section,
                subject,
                exam_date,
                exam_duration,
                exam_type
            FROM exams
            WHERE
                ($1 = '' OR class ILIKE $1)
                AND ($2 = '' OR section ILIKE $2)
                AND ($3 = '' OR exam_date::text ILIKE $3)
                AND ($4 = '' OR subject ILIKE $4)
                AND ($5 = '' OR exam_duration ILIKE $5)
                AND ($6 = '' OR exam_type ILIKE $6);
        `, [
            `%${className}%`,
            `%${section}%`,
            `%${examDate}%`,
            `%${subject}%`,
            `%${examDuration}%`,
            `%${examType}%`
        ]);

        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching filtered exams:", error);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        client.release();
    }
};

export const getAssignments = async (req, res) => {
    const client = await pool.connect();
    try {
        const {
            title = '',
            subject = '',
            className = '',
            section = '',
            teacherName = ''
        } = req.body || {};

        const result = await client.query(`
            SELECT 
                a.title,
                a.description,
                a.subject,
                a.class,
                a.section,
                u.name AS assigned_by,
                a.due_date,
                a.file
            FROM assignments a
            JOIN teachers t ON a.assigned_by = t.id
            JOIN users u ON t.user_id = u.id
            WHERE 
                ($1 = '' OR a.title ILIKE $1)
                AND ($2 = '' OR a.subject ILIKE $2)
                AND ($3 = '' OR a.class ILIKE $3)
                AND ($4 = '' OR a.section ILIKE $4)
                AND ($5 = '' OR u.name ILIKE $5);
        `, [
            `%${title}%`,
            `%${subject}%`,
            `%${className}%`,
            `%${section}%`,
            `%${teacherName}%`
        ]);

        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching assignments:", error);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        client.release();
    }
};