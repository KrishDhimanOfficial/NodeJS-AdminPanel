import mongoose from "mongoose"
import config from "./config.js"
import chalk from "chalk"

const options = { serverSelectionTimeoutMS: 10000, dbName: 'adminPanel' }

const connectDB = async () => {
    try {
        const res = await mongoose.connect(config.mongodb_URL, options)
        if (!res) console.log('DB connected!')
        console.log(chalk.gray('DB connected!'))
    } catch (error) {
        console.error(chalk.error(`connectDB : ${error.message}`))
    }

}

export default connectDB 