import mongoose from "mongoose"
import config from "./config.js"
import chalk from "chalk"
import { initAdmin } from "../services/initadmin.js"

const options = {
    serverSelectionTimeoutMS: 10000,
    dbName: String(process.env.DB_NAME),
    maxPoolSize: 10,
    serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
    }
}

const connectDB = async () => {
    try {
        const res = await mongoose.connect(config.mongodb_URL, options)

        if (res) {
            console.log(chalk.green('✅ MongoDB connected!'))
            console.log(chalk.gray(`📊 Connection state: ${mongoose.connection.readyState}`))

            // Initialize admin after successful connection
            await initAdmin()

            // Set up connection event listeners
            mongoose.connection.on('error', (err) => {
                console.error(chalk.red('❌ MongoDB connection error:', err.message))
            })

            mongoose.connection.on('disconnected', () => {
                console.log(chalk.yellow('⚠️ MongoDB disconnected'))
            })

            mongoose.connection.on('reconnected', () => {
                console.log(chalk.green('🔄 MongoDB reconnected'))
            })

        } else {
            console.error(chalk.red('❌ MongoDB connection failed'))
        }
    } catch (error) {
        console.error(chalk.red(`❌ MongoDB connection error: ${error.message}`))
        console.error(chalk.red(`❌ Stack: ${error.stack}`))
        process.exit(1)
    }
}

export default connectDB 