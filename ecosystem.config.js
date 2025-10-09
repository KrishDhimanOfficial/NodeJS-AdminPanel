export default {
    apps: [
        {
            name: "backend",
            script: './bin/www',
            exec_mode: "fork", // or "cluster" if you want multiple instances
            watch: false,
            env: {
                NODE_ENV: "production",
                PORT: process.env.PORT
            }
        }
    ]
};
