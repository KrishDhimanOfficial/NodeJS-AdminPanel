import dotenv from 'dotenv'
dotenv.config()

const config = {
    serverURL: process.env.SERVER_URL,
    port: parseInt(process.env.PORT) || 3000,
    mongodb_URL: String(process.env.MONGODB_URL),
    node_env: String(process.env.NODE_ENV),
    securityKey: String(process.env.SECURITY_KEY),
    mogo_store_secret_key: String(process.env.MOGO_STORE_SECRET_KEY),
    smtpHost: String(process.env.SMTP_HOST),
    smtpPort: parseInt(process.env.SMTP_PORT),
    smtpUsername: String(process.env.SMTP_USERNAME),
    smtpPassword: String(process.env.SMTP_PASSWORD),
    smtpservice: String(process.env.SMTP_SERVICE),
}

export default config