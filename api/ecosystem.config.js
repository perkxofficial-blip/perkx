const path = require('path');
const dotenv = require('dotenv');

const envFromFile =
  dotenv.config({ path: path.resolve(__dirname, '.env') }).parsed || {};

module.exports = {
  apps: [
    {
      name: 'nest-api',
      script: 'build/main.js',
      exec_mode: 'cluster',
      instances: 2,

      env: {
        ...envFromFile,
      },
    },
  ],
};
