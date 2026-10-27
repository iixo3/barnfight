import postgres from 'pg'

const connectionString = process.env.CHART_DB;

const pool = new postgres.Pool({
    connectionString: connectionString,
});

// Function to query the database
export const queryDatabase = async (queryText, values = []) => {
    try {
        const res = await pool.query(queryText, values);
        return res.rows;
    } catch (err) {
        console.error('Database query error', err.stack);
    }
};

export const insertPrice = async (price, time) => {
    const query = 'INSERT INTO graphic (price, time) VALUES ($1, $2)';
    await pool.query(query, [price, time]);

}
