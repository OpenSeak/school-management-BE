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
