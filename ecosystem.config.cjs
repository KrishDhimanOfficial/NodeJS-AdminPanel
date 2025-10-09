// ecosystem.config.cjs
module.exports = {
    apps: [
        {
            name: 'ADMINPANEL',
            script: './bin/www',
            exec_mode: 'fork',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '500M',
            // Only keep this if you truly need extensionless imports
            // node_args: '--experimental-specifier-resolution=node',
            env: {
                NODE_ENV: 'development',
                PORT: process.env.PORT || 3000
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: process.env.PORT || 3000
            }
        }
    ]
}