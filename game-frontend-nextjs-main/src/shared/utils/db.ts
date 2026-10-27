import { Pool } from "pg";

const connectionString = process.env.CHART_DB;

const pool = new Pool({
  connectionString: connectionString,
});

// Function to query the database
const queryDatabase = async (queryText: string, values: any[] = []) => {
  try {
    const res = await pool.query(queryText, values);
    return res.rows;
  } catch (err: any) {
    console.error("Database query error", err?.stack);
  }
};

export default queryDatabase;
