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

export const getStudentRoutine = async (req, res) => {
    const client = await pool.connect();
    try {
        const {
            className = '',
            section = '',
            timeSlot = '',
            teacherName = '',
            teacherSubject = '',
            day = ''
        } = req.body || {};

        const result = await client.query(`
            SELECT 
                sr.id,
                sr.class,
                sr.section,
                sr.day,
                sr.teacher_name,
                sr.teacher_subject,
                sr.day,
                sr.time_slot
            FROM student_routine sr
            WHERE 
                ($1 = '' OR sr.class ILIKE $1)
                AND ($2 = '' OR sr.section ILIKE $2)
                AND ($3 = '' OR sr.time_slot ILIKE $3)
                AND ($4 = '' OR sr.teacher_name ILIKE $4)
                AND ($5 = '' OR sr.teacher_subject ILIKE $5)
                AND ($6 = '' OR day ILIKE $6);
        `, [
            `%${className}%`,
            `%${section}%`,
            `%${timeSlot}%`,
            `%${teacherName}%`,
            `%${teacherSubject}%`,
            `%${day}%`
        ]);

        res.json(result.rows);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        client.release();
    }
};

export const getClassMonthlyAttendance = async (req, res) => {
    const client = await pool.connect();
    try {
        const {
            className = '',
            section = ''
        } = req.body || {};

        const query = `
            SELECT 
                s.class,
                s.section,
                COUNT(*) FILTER (WHERE a.status = 'Present') AS total_present,
                (
                    CASE EXTRACT(MONTH FROM a.date)
                        WHEN 1 THEN 31
                        WHEN 2 THEN 
                            CASE 
                                WHEN EXTRACT(YEAR FROM a.date)::INT % 4 = 0 AND 
                                     (EXTRACT(YEAR FROM a.date)::INT % 100 != 0 OR EXTRACT(YEAR FROM a.date)::INT % 400 = 0)
                                THEN 29
                                ELSE 28
                            END
                        WHEN 3 THEN 31
                        WHEN 4 THEN 30
                        WHEN 5 THEN 31
                        WHEN 6 THEN 30
                        WHEN 7 THEN 31
                        WHEN 8 THEN 31
                        WHEN 9 THEN 30
                        WHEN 10 THEN 31
                        WHEN 11 THEN 30
                        WHEN 12 THEN 31
                    END
                ) AS monthly_total
            FROM attendance a
            JOIN students s ON a.student_id = s.id
            WHERE 
                ($1 = '' OR s.class::TEXT ILIKE $1)
                OR ($2 = '' OR s.section ILIKE $2)
            GROUP BY s.class, s.section, EXTRACT(MONTH FROM a.date), EXTRACT(YEAR FROM a.date)
            ORDER BY s.class, s.section;
        `;

        const result = await client.query(query, [
            `%${className}%`,
            `%${section}%`
        ]);

        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching class monthly attendance:", error);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        client.release();
    }
};

export const getStudentAttendance = async (req, res) => {
    const client = await pool.connect();
    try {
        const {
            studentName = '',
            className = '',
            section = '',
            date = '',
            status = '',
            month = ''
        } = req.body || {};

        const monthNames = {
            January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
            July: 7, August: 8, September: 9, October: 10, November: 11, December: 12
        };

        const monthNumber = monthNames[month] || null;

        const query = `
            SELECT 
                u.name AS student_name,
                s.class,
                s.section,
                tu.name AS class_teacher,
                a.date,
                a.status
            FROM attendance a
            JOIN students s ON a.student_id = s.id
            JOIN users u ON s.user_id = u.id
            JOIN teachers t ON a.teacher_id = t.id
            JOIN users tu ON t.user_id = tu.id
            WHERE 
                ($1 = '' OR u.name ILIKE $1)
                AND ($2 = '' OR s.class::TEXT ILIKE $2)
                AND ($3 = '' OR s.section ILIKE $3)
                AND ($4 = '' OR a.date::TEXT ILIKE $4)
                AND ($5 = '' OR a.status ILIKE $5)
                AND ($6::INT IS NULL OR EXTRACT(MONTH FROM a.date) = $6::INT)
        `;

        const values = [
            `%${studentName}%`,
            `%${className}%`,
            `%${section}%`,
            `%${date}%`,
            `%${status}%`,
            monthNumber
        ];

        const result = await client.query(query, values);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        client.release();
    }
};

export const createAttendance = async (req, res) => {
    const client = await pool.connect();
  
    try {
      const { name: headerName, user: headerRole } = req.headers;
      const { name, class: classNum, section, roll_number, status, date } = req.body;
  
      if (!["present", "absent", "medical"].includes(status.toLowerCase())) {
        return res.status(400).json({ error: "Status must be Present, Absent, or Medical." });
      }
  
      const userResult = await client.query(
        `SELECT id FROM users WHERE name = $1 AND role = $2`,
        [headerName, headerRole]
      );
  
      if (userResult.rowCount === 0) {
        return res.status(404).json({
          error: `No ${headerRole} found with the name "${headerName}".`,
        });
      }
  
      const userId = userResult.rows[0].id;
  
      const teacherResult = await client.query(
        `SELECT id FROM teachers WHERE user_id = $1`,
        [userId]
      );
  
      if (teacherResult.rowCount === 0) {
        return res.status(404).json({
          error: `No teacher found linked to user "${headerName}".`,
        });
      }
  
      const teacherId = teacherResult.rows[0].id;
  
      const studentResult = await client.query(
        `SELECT id FROM students WHERE class = $1 AND section = $2 AND roll_number = $3`,
        [classNum, section, roll_number]
      );
  
      if (studentResult.rowCount === 0) {
        return res.status(404).json({
          error: `No student found in class ${classNum}${section} with roll number ${roll_number}.`,
        });
      }
  
      const studentId = studentResult.rows[0].id;
  
      const insertResult = await client.query(
        `INSERT INTO attendance (student_id, teacher_id, class, section, date, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [studentId, teacherId, classNum, section, date, status]
      );
  
      return res.status(201).json({
        message: "Attendance recorded successfully.",
        attendance: insertResult.rows[0],
      });
  
    } catch (error) {
      console.error("Error adding attendance:", error);
      return res.status(500).json({ error: "Internal server error." });
    } finally {
      client.release();
    }
};