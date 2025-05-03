import pool from "../config/db.js";

export const getStudentPerformance = async (req, res) => {
    const client = await pool.connect();
    try {
        const {
            studentName = '',
            className = '',
            section = '',
            subject = '',
            examType = '',
            teacherName = ''
        } = req.body || {};

        const result = await client.query(`
            SELECT 
                sp.id,
                u.name AS student_name,
                e.class AS student_class,
                u.photo AS student_photo,
                e.section AS student_section,
                u.phone,
                e.subject,
                e.exam_type,
                tu.name AS teacher_name,
                e.exam_date,
                e.exam_duration,
                sp.marks_obtained,
                sp.total_marks
            FROM student_performance sp
            JOIN users u ON sp.student_id = u.id
            JOIN exams e ON sp.exam_id = e.id
            JOIN teachers t ON e.class = t.assigned_class AND e.section = t.assigned_section
            JOIN users tu ON t.user_id = tu.id
            WHERE 
                ($1 = '' OR u.name ILIKE $1)
                AND ($2 = '' OR e.class::TEXT ILIKE $2)
                AND ($3 = '' OR e.section ILIKE $3)
                AND ($4 = '' OR e.subject ILIKE $4)
                AND ($5 = '' OR e.exam_type ILIKE $5)
                AND ($6 = '' OR tu.name ILIKE $6);
        `, [
            `%${studentName}%`,
            `%${className}%`,
            `%${section}%`,
            `%${subject}%`,
            `%${examType}%`,
            `%${teacherName}%`
        ]);

        res.json(result.rows);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        client.release();
    }
};

export const createPerformance = async (req, res) => {
    const client = await pool.connect();
  
    try {
      const { class: targetClass, section } = req.body;
  
      if (!Number.isInteger(targetClass) || !["A", "B", "C"].includes(section)) {
        return res.status(400).json({ error: "Invalid class or section." });
      }
  
      const teacherResult = await client.query(
        `SELECT id FROM teachers WHERE assigned_class = $1 AND assigned_section = $2`,
        [targetClass, section]
      );
  
      if (teacherResult.rowCount === 0) {
        return res.status(404).json({
          error: `No class teacher found for class ${targetClass} and section ${section}.`,
        });
      }
  
      const class_teacher_id = teacherResult.rows[0].id;
  
      const examResult = await client.query(
        `SELECT id FROM exams WHERE class = $1 AND section = $2`,
        [targetClass, section]
      );
  
      if (examResult.rowCount === 0) {
        return res.status(404).json({
          error: `No exams found for class ${targetClass} and section ${section}.`,
        });
      }
  
      const examIds = examResult.rows.map(row => row.id);
  
      const studentResult = await client.query(
        `SELECT id FROM students WHERE class = $1 AND section = $2`,
        [targetClass, section]
      );
  
      const studentIds = studentResult.rows.map(row => row.id);
  
      if (studentIds.length === 0) {
        return res.status(404).json({
          error: `No students found for class ${targetClass} and section ${section}.`,
        });
      }
  
      const insertedPerformances = [];
  
      for (let i = 0; i < examIds.length; i++) {
        const examId = examIds[i];
        const classPerformanceNo = i + 1;
  
        const existingPerformanceResult = await client.query(
          `SELECT COUNT(*) FROM performance
           WHERE class = $1 AND section = $2 AND exam_id = $3`,
          [targetClass, section, examId]
        );
  
        const count = parseInt(existingPerformanceResult.rows[0].count);
  
        if (count > 0) continue;
  
        const newPerformance = await client.query(
          `INSERT INTO performance (class, section, class_teacher, class_performance, exam_id)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [targetClass, section, class_teacher_id, classPerformanceNo, examId]
        );
  
        insertedPerformances.push(newPerformance.rows[0]);
      }
  
      if (insertedPerformances.length === 0) {
        return res.status(200).json({
          message: "All performance records already exist. No new entries added.",
        });
      }
  
      return res.status(201).json({
        message: "Performance records inserted successfully where missing.",
        performances: insertedPerformances,
      });
  
    } catch (error) {
      console.error("Error creating performance:", error);
      return res.status(500).json({ error: "Internal server error." });
    } finally {
      client.release();
    }
};

export const insertStudentPerformance = async (req, res) => {
    const client = await pool.connect();
    try {
      const {
        roll_number,
        class: studentClass,
        section,
        subject,
        exam_type,
        marks_obtained,
        total_marks,
      } = req.body;

      const studentResult = await client.query(
        `SELECT id FROM students WHERE roll_number = $1 AND class = $2 AND section = $3`,
        [roll_number, studentClass, section]
      );
  
      if (studentResult.rowCount === 0) {
        return res.status(404).json({
          error: `No student found with roll number "${roll_number}" in class "${studentClass}" section "${section}". Please verify the details.`,
        });
      }
  
      const student_id = studentResult.rows[0].id;
  
      const examResult = await client.query(
        `SELECT id FROM exams WHERE class = $1 AND section = $2 AND subject = $3 AND exam_type = $4`,
        [studentClass, section, subject, exam_type]
      );
  
      if (examResult.rowCount === 0) {
        return res.status(404).json({
          error: `No scheduled exam found for subject "${subject}", exam type "${exam_type}" in class "${studentClass}" section "${section}". Please ensure the exam is scheduled.`,
        });
      }
  
      const exam_id = examResult.rows[0].id;
  
      const checkResult = await client.query(
        `SELECT * FROM student_performance WHERE student_id = $1 AND exam_id = $2`,
        [student_id, exam_id]
      );
  
      if (checkResult.rowCount > 0) {
        return res.status(400).json({
          error: `Performance for student with roll number "${roll_number}" has already been recorded for this exam.`,
        });
      }
  
      const insertResult = await client.query(
        `INSERT INTO student_performance (student_id, exam_id, marks_obtained, total_marks) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [student_id, exam_id, marks_obtained, total_marks]
      );
  
      return res.status(201).json({
        message: "Performance added successfully.",
        data: insertResult.rows[0],
      });
    } catch (error) {
      console.error("Insert error:", error);
      return res.status(500).json({ error: "Internal server error." });
    } finally {
      client.release();
    }
};