import pool from "../config/db.js";

export const getStudents = async (req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query("SELECT * FROM students");
        res.json(result.rows);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        client.release();
    }
};

export const getNotice = async (req, res) => {
    const client = await pool.connect();
    try {
        const student = await client.query("SELECT * FROM notices");
        res.json(student.rows);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        client.release();
    }
};

export const getClassRepresentatives = async (req, res) => {
    const client = await pool.connect();
    try {
        const student = await client.query("SELECT cr.id, u.name, u.photo, cr.class, cr.section, u.phone FROM class_representatives cr JOIN students s ON cr.student_id = s.id JOIN users u ON s.user_id = u.id");
        res.json(student.rows);
    } catch (error) {
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

export const getSpecificCalendar = async (req, res) => {
    const client = await pool.connect();
    try {
        const { month = '' } = req.body;

        const result = await client.query(
            `SELECT * FROM calendar
             WHERE ($1 = '' OR month ILIKE $1)
             ORDER BY year,
                CASE 
                    WHEN month = 'January' THEN 1
                    WHEN month = 'February' THEN 2
                    WHEN month = 'March' THEN 3
                    WHEN month = 'April' THEN 4
                    WHEN month = 'May' THEN 5
                    WHEN month = 'June' THEN 6
                    WHEN month = 'July' THEN 7
                    WHEN month = 'August' THEN 8
                    WHEN month = 'September' THEN 9
                    WHEN month = 'October' THEN 10
                    WHEN month = 'November' THEN 11
                    WHEN month = 'December' THEN 12
                END`,
            [month]
        );

        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching calendar:", error);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        client.release();
    }
};

export const getAllCalendar = async (req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query(
            `SELECT * FROM calendar
             ORDER BY year,
                CASE 
                    WHEN month = 'January' THEN 1
                    WHEN month = 'February' THEN 2
                    WHEN month = 'March' THEN 3
                    WHEN month = 'April' THEN 4
                    WHEN month = 'May' THEN 5
                    WHEN month = 'June' THEN 6
                    WHEN month = 'July' THEN 7
                    WHEN month = 'August' THEN 8
                    WHEN month = 'September' THEN 9
                    WHEN month = 'October' THEN 10
                    WHEN month = 'November' THEN 11
                    WHEN month = 'December' THEN 12
                END`
        );
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching all calendar data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        client.release();
    }
};

export const getFinanceReport = async (req, res) => {
    const client = await pool.connect();
    try {
        const { 
            name, 
            class: studentClass, 
            section,
            month
        } = req.body || {};

        const result = await client.query(
            `SELECT 
                u.name AS student_name,
                u.phone AS student_phone,
                s.class AS student_class,
                s.section AS student_section,
                f.total_fee,
                f.paid_amount,
                f.due_amount,
                f.month,
                f.payment_status,
                f.penalty,
                f.expenses
            FROM finances f
            JOIN students s ON f.student_id = s.id
            JOIN users u ON s.user_id = u.id
            WHERE 
                ($1 = '' OR u.name ILIKE $1) AND
                ($2 = '' OR s.class = $2) AND
                ($3 = '' OR s.section = $3) AND
                ($4 = '' OR f.month ILIKE $4)`,
            [
                name ? `%${name}%` : '',
                studentClass || '',
                section || '',
                month ? `%${month}%` : ''
            ]
        );

        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching finance report:", error);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        client.release();
    }
};
