export default () => ({
  port: parseInt(process.env.PORT, 10),
  jwt: {
    userSecret: process.env.USER_JWT_SECRET,
    adminSecret: process.env.ADMIN_JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  },
  storage: {
    diskDriver: process.env.DISK_DRIVER,
    localPath: process.env.STORAGE_LOCAL_PATH,
    localBaseUrl: process.env.STORAGE_LOCAL_BASE_URL,
    s3: {
      cdn: process.env.PUBLIC_STATIC_CDN,
      bucket: process.env.AWS_S3_BUCKET,
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  },
  timezone: {
    default: process.env.TZ || process.env.TIMEZONE || 'Asia/Singapore',
  },
});
