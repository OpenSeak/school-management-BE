import pool from "../config/db.js";

export const getStudents = async (req, res) => {
    const client = await pool.connect();
    try {
        const {
            name = '',
            class: studentClass = '',
            section = '',
            parent_name = '',
            admission_number = ''
        } = req.body || {};

        const query = `
            SELECT 
                s.id,
                s.user_id,
                u.name AS student_name,
                u.photo AS student_photo,
                u.phone AS student_phone,
                s.admission_number,
                s.class,
                s.section,
                s.parent_name,
                s.parent_phone,
                s.parent_email,
                s.parent_work,
                s.parent_photo1,
                s.parent_photo2,
                s.guardian_photo,
                s.guardian_phone
            FROM students s
            JOIN users u ON s.user_id = u.id
            WHERE 
                ($1 = '' OR u.name ILIKE $1) AND
                ($2 = '' OR s.class = $2) AND
                ($3 = '' OR s.section = $3) AND
                ($4 = '' OR s.parent_name ILIKE $4) AND
                ($5 = '' OR s.admission_number = $5);
        `;

        const values = [
            name ? `%${name}%` : '',
            studentClass,
            section,
            parent_name ? `%${parent_name}%` : '',
            admission_number
        ];

        const result = await client.query(query, values);

        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        client.release();
    }
};

export const getParentProfile = async (req, res) => {
    const client = await pool.connect();
    try {
        const student = await client.query(`SELECT 
        s.parent_name,
        s.parent_phone,
        s.parent_photo1,
        s.parent_photo2,
        s.guardian_photo,
        s.parent_work,
        s.parent_email,
        u.address,
        u.name AS student_name,
        s.class,
        s.section,
        u.phone AS student_phone,
        u.photo AS student_photo
        FROM  students s JOIN users u ON s.user_id = u.id;
    `);
        res.json(student.rows);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", error });
    } finally {
        client.release();
    }
};

export const getSpecificParentProfile = async (req, res) => {
    const client = await pool.connect();
    try {
        const { name, class: studentClass, section, admission_number } = req.body;

        const result = await client.query(
            `SELECT 
                s.parent_name, s.parent_phone, s.parent_email, s.parent_work,
                u.name AS student_name, s.class, s.section,
                s.admission_number, u.phone AS student_phone
            FROM students s
            JOIN users u ON s.user_id = u.id
            WHERE 
                ($1 = '' OR u.name ILIKE $1) AND
                ($2 = '' OR s.class = $2) AND
                ($3 = '' OR s.section = $3) AND
                ($4 = '' OR s.admission_number = $4)
            `,
            [
                name ? `%${name}%` : '',
                studentClass || '',
                section || '',
                admission_number || ''
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "No matching parent/student found." });
        }

        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching parent profile:", error);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        client.release();
    }
};

