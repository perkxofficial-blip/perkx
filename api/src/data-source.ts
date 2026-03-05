import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config(); // Load .env file

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10) ,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  // ssl: process.env.NODE_ENV === 'production' ? true : false, // Enable SSL for secure connection to AWS RDS
  // extra: {
  //   ssl: {
  //     rejectUnauthorized: process.env.NODE_ENV === 'production' ? false : true,
  //   },
  // },
});
