export default {
    apps: [
        {
            name: "ADMINPANEL",
            script: 'bin/www',
            instances: "max",            // Or 1 for single instance
            autorestart: true,
            watch: false,
            max_memory_restart: "500M",
            exec_mode: "fork",           // Clustering with ES modules can be tricky
            node_args: "--experimental-specifier-resolution=node",
            env: {
                NODE_ENV: "production",
                PORT: process.env.PORT || 3000
            }
        }
    ]
}