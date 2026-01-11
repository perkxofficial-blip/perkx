import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User, Admin } from './entities';

config(); // Load .env file

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'perkx_db',
  entities: [User, Admin],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false, // Tắt auto sync khi dùng migrations
});
