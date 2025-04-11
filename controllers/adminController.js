import pool from "../config/db.js";

// insert studnet data 
export const addStudent = async (req, res) => {
    const client = await pool.connect();
    try {
        const {
            name,
            email,
            password,
            phone,
            address,
            photo,
            admission_number,
            class: studentClass,
            section,
            parent_name,
            parent_phone,
            parent_email,
            parent_work,
            parent_photo1,
            parent_photo2,
            guardian_photo = null,
            guardian_phone = null
        } = req.body;
        if (!name || !email || !password || !admission_number || !studentClass || !section || !parent_name) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        await client.query("BEGIN");
        const insertUserQuery = `
            INSERT INTO users (name, email, password, role, phone, address, photo)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        `;
        const userResult = await client.query(insertUserQuery, [
            name,
            email,
            password,
            "student",
            phone,
            address,
            photo
        ]);
        const userId = userResult.rows[0].id;
        const insertStudentQuery = `
            INSERT INTO students (
                user_id, admission_number, class, section,
                parent_name, parent_phone, parent_email, parent_work,
                parent_photo1, parent_photo2, guardian_photo, guardian_phone
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `;
        await client.query(insertStudentQuery, [
            userId,
            admission_number,
            studentClass,
            section,
            parent_name,
            parent_phone,
            parent_email,
            parent_work,
            parent_photo1,
            parent_photo2,
            guardian_photo,
            guardian_phone
        ]);
        await client.query("COMMIT");
        res.status(201).json({ message: "Student added successfully." });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error inserting student:", error);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        client.release();
    }
};

//insert teacher 
export const addTeacher = async (req, res) => {
    const client = await pool.connect();
    try {
        const {
            name,
            email,
            password,
            phone,
            address,
            photo,
            specialised_subject,
            assigned_class,
            assigned_section
        } = req.body;
        if (!name || !email || !password || !phone || !specialised_subject || !assigned_class || !assigned_section) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        await client.query("BEGIN");
        const classCheck = await client.query(
            `SELECT * FROM teachers WHERE assigned_class = $1`,
            [assigned_class]
        );
        const sectionCheck = await client.query(
            `SELECT * FROM teachers WHERE assigned_class = $1`,
            [assigned_section]
        );
        if (classCheck.rows.length > 0 && sectionCheck.rows.length > 0) {
            return res.status(400).json({ error: `Class ${assigned_class} already has a class teacher.` });
        }
        const insertUserQuery = `
            INSERT INTO users (name, email, password, role, phone, address, photo)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        `;
        const userResult = await client.query(insertUserQuery, [
            name,
            email,
            password,
            "teacher",
            phone,
            address,
            photo
        ]);
        const userId = userResult.rows[0].id;
        const insertTeacherQuery = `
            INSERT INTO teachers (
                user_id,
                specialised_subject,
                assigned_class,
                assigned_section
            )
            VALUES ($1, $2, $3, $4)
        `;
        await client.query(insertTeacherQuery, [
            userId,
            specialised_subject,
            assigned_class,
            assigned_section
        ]);

        await client.query("COMMIT");
        res.status(201).json({ message: "Teacher added successfully." });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error inserting teacher:", error);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        client.release();
    }
};
