import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgres://myuser:mypassword@localhost:5432/mydb',
});

export default pool;