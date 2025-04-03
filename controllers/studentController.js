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
