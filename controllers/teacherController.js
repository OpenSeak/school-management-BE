import pool from "../config/db.js";

export const getTeachers = async (req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query("SELECT * FROM teachers");
        res.json(result.rows);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error});
    } finally {
        client.release();
    }
};
