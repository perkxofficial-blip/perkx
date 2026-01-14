// src/config/typeorm.config.ts
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from '../entities/user.entity'; // Import your entities here
// ... other imports

config(); // Load environment variables from .env file

const AppDataSource = new DataSource({
  type: 'postgres', // or 'mysql', 'sqlite', etc.
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'], // Path to your entities
  migrations: [__dirname + '/../db/migrations/*.ts'], // Path to your migrations
  synchronize: false, // Set to false for production; useful for dev
});

export default AppDataSource;
