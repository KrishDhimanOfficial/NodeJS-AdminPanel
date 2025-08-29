import nodemailer from 'nodemailer'
import config from '../config/config.js'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const emailTemplatePath = path.join(__dirname, '../views/emailTemplate.html')

const transporter = nodemailer.createTransport({
    service: config.smtpservice,
    port: config.smtpPort,
    secure: true,
    auth: {
        user: config.smtpUsername,
        pass: config.smtpPassword // Use App Password if 2FA is enabled
    }
})

const sendEmail = async (name, receiverEMAIL, options = {}) => {
    try {
        const emailTemplate = await fs.readFile(emailTemplatePath, 'utf8')
        await transporter.sendMail({ // Send Verification Email
            from: config.smtpUsername,
            to: receiverEMAIL,
            subject: options.subject || 'Email Verification',
            html: emailTemplate
                .replace('{{username}}', name.toUpperCase())
                .replace('{{verifyUrl}}', verifyLink)
                .replace('{{year}}', new Date().getFullYear())
        })
    } catch (error) {
        return res.status(400).json({ error: 'Something went wrong, please try again later.' })
    }
}

export default sendEmail