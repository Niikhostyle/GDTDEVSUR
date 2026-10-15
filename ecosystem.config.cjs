module.exports = {
  apps: [
    {
      name: "gdtdevsur",
      script: "./dist/server/entry.mjs",
      cwd: "/var/www/f511adf8-af5e-4a83-980c-bd6fd1d378c2/app",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        HOST: "127.0.0.1",
        PORT: "3055",
        PUBLIC_SITE_URL: "https://gdtdevsur.cl",
      },
    },
  ],
};
