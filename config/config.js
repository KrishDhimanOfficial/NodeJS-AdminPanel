import dotenv from 'dotenv'
dotenv.config()

const config = {
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.pdf'],
    serverURL: process.env.SERVER_URL,
    port: parseInt(process.env.PORT) || 3000,
    mongodb_URL: String(process.env.MONGODB_URL),
    node_env: String(process.env.NODE_ENV),
    securityKey: String(process.env.SECURITY_KEY),
    jwt_key: String(process.env.JWT_KEY),
    jwt_refresh_key: String(process.env.JWT_REFRESH_KEY),
    mogo_store_secret_key: String(process.env.MOGO_STORE_SECRET_KEY),
    smtpHost: String(process.env.SMTP_HOST),
    smtpPort: parseInt(process.env.SMTP_PORT),
    smtpUsername: String(process.env.SMTP_USERNAME),
    smtpPassword: String(process.env.SMTP_PASSWORD),
    smtpservice: String(process.env.SMTP_SERVICE),
    crud_url: process.env.CRUD_URL === 'true',
}

export default config