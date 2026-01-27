export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  jwt: {
    userSecret: process.env.USER_JWT_SECRET || 'user-jwt-secret-key-change-this-in-production',
    adminSecret: process.env.ADMIN_JWT_SECRET || 'admin-jwt-secret-key-change-this-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
  database: {
    host: process.env.DATABASE_HOST || process.env.DB_HOST,
    port:
      parseInt(process.env.DATABASE_PORT, 10) ||
      parseInt(process.env.DB_PORT, 10) ||
      5432,
    username: process.env.DATABASE_USER || process.env.DB_USERNAME,
    password: process.env.DATABASE_PASSWORD || process.env.DB_PASSWORD,
    database: process.env.DATABASE_NAME || process.env.DB_DATABASE,
  },
  storage: {
    diskDriver: process.env.DISK_DRIVER || 'local',
    localPath: process.env.STORAGE_LOCAL_PATH || './uploads',
    localBaseUrl: process.env.STORAGE_LOCAL_BASE_URL || 'localhost/uploads',
    s3: {
      cdn: process.env.PUBLIC_STATIC_CDN,
      bucket: process.env.AWS_S3_BUCKET,
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  },
});
