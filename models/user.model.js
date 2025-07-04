import mongoose from "mongoose"
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema({
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
    image: {
        type: String
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false,
    },
},
    { timestamps: true }
)

/**
 * 🛡️ Bypass password required on updates
 */
userSchema.pre('validate', function (next) {
    if (!this.isNew && !this.isModified('password')) {
        this.$ignore('password') // <-- ✅ this disables validation on update
    }
    next()
})

/**
 * 🔒 Hash password on create/update
 */
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()
    this.password = await bcrypt.hash(this.password, 12)
    next()
})

export default mongoose.model('user', userSchema)