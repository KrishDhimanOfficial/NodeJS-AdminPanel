import adminModel from '../models/admin.model.js';
import bcrypt from 'bcrypt';

export const initAdmin = async () => {
    const existing = await adminModel.findOne({ role: 'superAdmin' })

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
