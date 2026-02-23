module.exports = {
  apps: [
    {
      name: 'nest-api',
      script: 'build/main.js',
      exec_mode: 'cluster',
      instances: 2,
      watch: true,
      // Load file env
      env_file: '/var/www/perkx/api/.env',

      env: {
        NODE_ENV: 'development',
      },
    },
  ],
};
