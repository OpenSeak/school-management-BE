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
