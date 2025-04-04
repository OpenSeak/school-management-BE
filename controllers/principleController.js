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



