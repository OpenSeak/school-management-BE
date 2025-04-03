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