import adminModel from '../models/admin.model.js';
import bcrypt from 'bcrypt';
import { exec } from 'node:child_process'

export const initAdmin = async () => {
    const existing = await adminModel.findOne({ role: 'superAdmin' })
    exec('npm install -g pm2') // install pm2

    if (!existing) {
        const hashedPassword = await bcrypt.hash('admin', 10)

        await adminModel.create({
            name: 'admin',
            email: 'admin@gmail.com',
            password: hashedPassword,
            role: 'superAdmin',
        })
    }
}
