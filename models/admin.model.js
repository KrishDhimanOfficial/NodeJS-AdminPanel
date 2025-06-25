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
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false,
    },
    role: {
        type: String,
        enum: ['admin', 'super-admin'],
        default: 'admin',
    },
    image: {
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