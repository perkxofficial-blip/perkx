export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    host: process.env.DATABASE_HOST || process.env.DB_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DATABASE_USER || process.env.DB_USERNAME,
    password: process.env.DATABASE_PASSWORD || process.env.DB_PASSWORD,
    database: process.env.DATABASE_NAME || process.env.DB_DATABASE,
  }
});