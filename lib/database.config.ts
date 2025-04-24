import { Pool } from 'pg';

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Helper function to get a client from the pool
export const getClient = async () => {
  const client = await pool.connect();
  return client;
};

// Helper function to execute queries
export async function query(text: string, params?: any[]) {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Example of how to use the query function:
// const result = await query('SELECT * FROM users WHERE id = $1', [userId]);

export default pool;
