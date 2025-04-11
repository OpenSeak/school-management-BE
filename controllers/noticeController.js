import pool from "../config/db.js";

export const addNotice = async (req, res) => {
    const client = await pool.connect();
    try {
        const { title, content, target_role } = req.body;
        const userType = req.headers["user"];
        const name = req.headers["name"];
        if (!userType || !name) {
            return res.status(400).json({ error: "User type and name must be provided in headers." });
        }
        if (!title || !content || !target_role) {
            return res.status(400).json({ error: "Title, content and target role are required." });
        }
        const query = `
            SELECT id FROM users WHERE name = $1 AND role = $2 LIMIT 1
        `;
        const result = await client.query(query, [name, userType.toLowerCase()]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found with given name and role." });
        }
        const createdById = result.rows[0].id;
        const insertNotice = `
            INSERT INTO notices (title, content, created_at, created_by, target_role)
            VALUES ($1, $2, NOW(), $3, $4)
        `;
        await client.query(insertNotice, [title, content, createdById, target_role]);
        res.status(201).json({ message: "Notice added successfully." });
    } catch (error) {
        console.error("Error inserting notice:", error);
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