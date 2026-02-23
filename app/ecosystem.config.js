const path = require('path');
const dotenv = require('dotenv');

const envFromFile =
  dotenv.config({ path: path.resolve(__dirname, '.env') }).parsed || {};

module.exports = {
  apps: [
    {
      name: "nextjs-ssr",
      script: "npm",
      args: "start",
      exec_mode: "cluster",
      instances: "1",
      env: {
        ...envFromFile,
      },
    }
  ]
}
