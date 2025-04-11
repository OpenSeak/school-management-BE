import pool from "../config/db.js";

//Insert the Notes data
export const insertNote = async (req, res) => {
  const { user, name } = req.headers;
  const { title, content, subject, class: noteClass, section, files } = req.body;
  try {
    if (user !== "teacher") {
      return res.status(403).json({ error: "Only teachers can create notes." });
    }

    const userResult = await pool.query("SELECT id FROM users WHERE name = $1 AND role = 'teacher'", [name]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    const created_by = userResult.rows[0].id;
    const created_at = new Date();

    const noteResult = await pool.query(
      `INSERT INTO notes (title, content, subject, class, section, created_by, files, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [title, content, subject, noteClass, section, created_by, files || null, created_at]
    );

    res.status(201).json({ message: "Note created successfully", note: noteResult.rows[0] });
  } catch (err) {
    console.error("Error inserting note:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

//Get all notes
export const getNotes = async (req, res) => {
    const client = await pool.connect();
    try {
        const {
            title = '',
            givenBy = '',
            uploadedBy = '',
            className = '',
            section = '',
            subject = ''
        } = req.body || {};

        const result = await client.query(`
            SELECT
                n.title,
                n.content AS given_by,
                u.name AS uploaded_by,
                n.class,
                n.section,
                n.subject,
                n.files,
                COALESCE(n.created_at::date, CURRENT_DATE) AS date
            FROM notes n
            JOIN users u ON n.created_by = u.id
            WHERE 
                ($1 = '' OR n.title ILIKE $1) AND
                ($2 = '' OR n.content ILIKE $2) AND
                ($3 = '' OR u.name ILIKE $3) AND
                ($4 = '' OR n.class ILIKE $4) AND
                ($5 = '' OR n.section ILIKE $5) AND
                ($6 = '' OR n.subject ILIKE $6)
        `, [
            `%${title}%`,
            `%${givenBy}%`,
            `%${uploadedBy}%`,
            `%${className}%`,
            `%${section}%`,
            `%${subject}%`
        ]);

        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching filtered notes:", error);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        client.release();
    }
};
