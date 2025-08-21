import mongoose from "mongoose"
import config from "./config.js"
import chalk from "chalk"
import { initAdmin } from "../services/initadmin.js"

const options = {
    serverSelectionTimeoutMS: 10000,
    dbName: String(process.env.DB_NAME),
}

const connectDB = async () => {
    try {
        await mongoose.connect(config.mongodb_URL, options)
        console.log(chalk.green(`✅ MongoDB connected!`))

        // Initialize admin after successful connection
        await initAdmin()
    } catch (error) {
        console.error(chalk.red(`❌ MongoDB connection error: ${error.message}`))
        process.exit(1)
    }
}

export default connectDB 