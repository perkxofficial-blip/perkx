module.exports = {
  apps: [
    {
      name: "nextjs-ssr",
      script: "npm",
      args: "start",
      exec_mode: "cluster",
      instances: "1",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      }
    }
  ]
}
