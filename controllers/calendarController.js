import pool from "../config/db.js";

export const addCalendarEntry = async (req, res) => {
    const client = await pool.connect();

    try {
        const { month, calendar, year } = req.body;

        if (!month || !calendar || !year) {
            return res.status(400).json({ error: "Month, calendar image name, and year are required." });
        }

        const insertQuery = `
            INSERT INTO calendar (month, calendar, year)
            VALUES ($1, $2, $3)
        `;

        await client.query(insertQuery, [month, calendar, year]);

        res.status(201).json({ message: "Calendar entry added successfully." });

    } catch (error) {
        console.error("Error adding calendar entry:", error);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        client.release();
    }
};

export const getSpecificCalendar = async (req, res) => {
    const client = await pool.connect();
    try {
        const { month = '' } = req.body;

        const result = await client.query(
            `SELECT * FROM calendar
             WHERE ($1 = '' OR month ILIKE $1)
             ORDER BY year,
                CASE 
                    WHEN month = 'January' THEN 1
                    WHEN month = 'February' THEN 2
                    WHEN month = 'March' THEN 3
                    WHEN month = 'April' THEN 4
                    WHEN month = 'May' THEN 5
                    WHEN month = 'June' THEN 6
                    WHEN month = 'July' THEN 7
                    WHEN month = 'August' THEN 8
                    WHEN month = 'September' THEN 9
                    WHEN month = 'October' THEN 10
                    WHEN month = 'November' THEN 11
                    WHEN month = 'December' THEN 12
                END`,
            [month]
        );

        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching calendar:", error);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        client.release();
    }
};

export const getAllCalendar = async (req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query(
            `SELECT * FROM calendar
             ORDER BY year,
                CASE 
                    WHEN month = 'January' THEN 1
                    WHEN month = 'February' THEN 2
                    WHEN month = 'March' THEN 3
                    WHEN month = 'April' THEN 4
                    WHEN month = 'May' THEN 5
                    WHEN month = 'June' THEN 6
                    WHEN month = 'July' THEN 7
                    WHEN month = 'August' THEN 8
                    WHEN month = 'September' THEN 9
                    WHEN month = 'October' THEN 10
                    WHEN month = 'November' THEN 11
                    WHEN month = 'December' THEN 12
                END`
        );
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching all calendar data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        client.release();
    }
};
