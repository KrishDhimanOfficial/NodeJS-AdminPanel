import nodemailer from 'nodemailer'
import config from '../config/config.js'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const emailTemplatePath = path.join(__dirname, '../views/emailTemplate.html')
const emailTemplate = fs.readFile(emailTemplatePath, 'utf8')

const transporter = nodemailer.createTransport({
    service: config.smtpservice,
    port: config.smtpPort,
    secure: true,
    auth: {
        user: config.smtpUsername,
        pass: config.smtpPassword // Use App Password if 2FA is enabled
    }
})

const sendEmail = async (senderEMAIL, receiverEMAIL, verifyLink) => {
    try {
        // const rawToken = crypto.randomBytes(32).toString('hex')
        // const verifyLink = crypto.createHash('sha256').update(rawToken).digest('hex')
        await transporter.sendMail({ // Send Verification Email
            from: senderEMAIL,
            to: receiverEMAIL,
            subject: 'Verify Your Email',
            html: emailTemplate.replace('{{username}}', name).replace('{{verifyUrl}}', verifyLink).replace('{{year}}', new Date().getFullYear())
        })
    } catch (error) {

    }
}

export default sendEmail