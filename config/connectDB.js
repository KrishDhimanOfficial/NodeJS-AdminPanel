import mongoose from "mongoose"
import config from "./config.js"
import chalk from "chalk"
import { initAdmin } from "../services/initadmin.js"

const options = { serverSelectionTimeoutMS: 10000, dbName: process.env.DB_NAME }

const connectDB = async () => {
    try {
        const res = await mongoose.connect(config.mongodb_URL, options)
        if (!res) console.log('DB connected!')
        initAdmin()
        console.log(chalk.gray('DB connected!'))
    } catch (error) {
        console.error(chalk.error(`connectDB : ${error.message}`))
    }

}

export default connectDB 