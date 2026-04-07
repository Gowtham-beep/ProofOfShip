import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../../../.env') });

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 10000
});


export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

export const initDb = async () => {
  try {
    const migrations = ['001_create_users.sql', '002_create_repos.sql', '003_create_scores.sql'];
    for (const file of migrations) {
      const migrationPath = path.join(__dirname, 'migrations', file);
      const migrationSql = fs.readFileSync(migrationPath, 'utf-8');
      await pool.query(migrationSql);
    }
    console.log('Database migrations applied successfully.');
  } catch (error: any) {
    console.error('Failed to apply database migration:', error.message || error);
    throw error;
  }
};
