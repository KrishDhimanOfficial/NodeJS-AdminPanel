import mongoose from "mongoose"
import bcrypt from 'bcrypt'

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: [true, 'Email Already in use.'],
        lowercase: [true, 'Email is not in lowercase.'],
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please fill a valid email address.'
        ]
    },
    role: {
        type: String,
        enum: ['superAdmin', 'admin',],
        default: 'admin',
    },
    phone: {
        type: String,
        default: null,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
    },
    profile: {
        type: String,
    },
},
    { timestamps: true }
)

adminSchema.pre('save', async function (next) {
    if (this.isModified('password')) { this.password = bcrypt.hash(this.password, 12) }
    next()
})

export default mongoose.model('Admin', adminSchema)