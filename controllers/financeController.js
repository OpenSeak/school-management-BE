import pool from "../config/db.js";

//Insert in the financecheckbook table
export const insertFinanceRecord = async (req, res) => {
  const { month, income, expenses, total_due_amount } = req.body;

  if (!month || income == null || expenses == null || total_due_amount == null) {
    return res.status(400).json({ error: "All fields (month, income, expenses, total_due_amount) are required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO financecheckbook (month, income, expenses, total_due_amount)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [month, income, expenses, total_due_amount]
    );

    return res.status(201).json({
      message: "Finance record added successfully",
      finance: result.rows[0],
    });
  } catch (err) {
    console.error("Error inserting finance record:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

//Get all the finance Check book
export const getFinanceRecords = async (req, res) => {
    const { month } = req.body;
  
    try {
      let result;
  
      if (month) {
        result = await pool.query(
          `SELECT * FROM financecheckbook WHERE LOWER(month) = LOWER($1)`,
          [month]
        );
  
        if (result.rows.length === 0) {
          return res.status(404).json({ message: `No finance record found for month: ${month}` });
        }
      } else {
        result = await pool.query(`SELECT * FROM financecheckbook ORDER BY id`);
      }
  
      return res.status(200).json({
        message: month ? `Finance record for ${month}` : "All finance records",
        data: result.rows,
      });
    } catch (err) {
      console.error("Error fetching finance records:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
};

//Insert in Finances table 
export const insertFinanceEntry = async (req, res) => {
    const {
      student_name,
      total_fee,
      paid_amount,
      month,
      payment_status,
      penalty,
      expenses,
    } = req.body;
  
    try {
      const userResult = await pool.query(
        `SELECT id FROM users WHERE LOWER(name) = LOWER($1) AND role = 'student'`,
        [student_name]
      );
  
      if (userResult.rows.length === 0) {
        return res.status(404).json({ message: "Student not found in users table" });
      }
  
      const user_id = userResult.rows[0].id;
      const studentResult = await pool.query(
        `SELECT id FROM students WHERE user_id = $1`,
        [user_id]
      );
  
      if (studentResult.rows.length === 0) {
        return res.status(404).json({ message: "Student not found in students table" });
      }
  
      const student_id = studentResult.rows[0].id;
      const due_amount = parseFloat(total_fee) - parseFloat(paid_amount);
      await pool.query(
        `INSERT INTO finances (student_id, total_fee, paid_amount, month, payment_status, penalty, expenses)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [student_id, total_fee, paid_amount, month, payment_status, penalty, expenses]
      );
  
      res.status(201).json({
        message: "Finance record inserted successfully",
        data: {
          student_id,
          total_fee,
          paid_amount,
          due_amount,
          month,
          payment_status,
          penalty,
          expenses,
        },
      });
    } catch (err) {
      console.error("Error inserting finance record:", err);
      res.status(500).json({ error: "Internal server error" });
    }
};

// Get all the Finance Report
export const getFinanceReport = async (req, res) => {
    const client = await pool.connect();
    try {
        const { 
            name, 
            class: studentClass, 
            section,
            month
        } = req.body || {};

        const result = await client.query(
            `SELECT 
                u.name AS student_name,
                u.phone AS student_phone,
                s.class AS student_class,
                s.section AS student_section,
                f.total_fee,
                f.paid_amount,
                f.due_amount,
                f.month,
                f.payment_status,
                f.penalty,
                f.expenses
            FROM finances f
            JOIN students s ON f.student_id = s.id
            JOIN users u ON s.user_id = u.id
            WHERE 
                ($1 = '' OR u.name ILIKE $1) AND
                ($2 = '' OR s.class = $2) AND
                ($3 = '' OR s.section = $3) AND
                ($4 = '' OR f.month ILIKE $4)`,
            [
                name ? `%${name}%` : '',
                studentClass || '',
                section || '',
                month ? `%${month}%` : ''
            ]
        );

        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching finance report:", error);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        client.release();
    }
};

