import pool from "../config/db.js";

//Insert class Represntative data in database
export const insertClassRepresentative = async (req, res) => {
    const { name, class: studentClass, section } = req.body;
  
    try {
      const userResult = await pool.query(
        `SELECT id FROM users WHERE name = $1 AND role = 'student'`,
        [name]
      );
  
      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: "Student not found in users table" });
      }
      const user_id = userResult.rows[0].id;
      const studentResult = await pool.query(
        `SELECT id FROM students WHERE user_id = $1 AND class = $2 AND section = $3`,
        [user_id, studentClass, section]
      );
  
      if (studentResult.rows.length === 0) {
        return res.status(404).json({ error: "Student not found in students table with provided class and section" });
      }
  
      const student_id = studentResult.rows[0].id;
  
      const countResult = await pool.query(
        `SELECT COUNT(*) FROM class_representatives WHERE class = $1 AND section = $2`,
        [studentClass, section]
      );
  
      if (parseInt(countResult.rows[0].count) >= 2) {
        return res.status(400).json({ error: "Maximum class representatives already assigned for this section of class" });
      }
  
      const insertResult = await pool.query(
        `INSERT INTO class_representatives (student_id, class, section)
         VALUES ($1, $2, $3) RETURNING *`,
        [student_id, studentClass, section]
      );
  
      res.status(201).json({ message: "Class representative added", data: insertResult.rows[0] });
  
    } catch (err) {
      console.error("Error inserting class representative:", err);
      res.status(500).json({ error: "Internal server error" });
    }
};

//Get Class Representative data
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