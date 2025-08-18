import mongoose from 'mongoose'
import path from 'node:path'
import chalk from 'chalk'

import { fileURLToPath, pathToFileURL } from 'node:url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default async function registerModel(modelName) {
    let mongooseModel;
    if (mongoose.models[modelName]) {
        mongooseModel = mongoose.model(modelName)
    } else {
        try {
            const modelPath = path.join(__dirname, '../models', `${modelName}.model.js`)
            const modelFileUrl = pathToFileURL(modelPath).href; // ✅ convert to file:// URL

            await import(modelFileUrl) // ✅ safe for Windows & Mac/Linux
            mongooseModel = mongoose.model(modelName)
        } catch (err) {
            chalk.red(console.log(`❌ Model "${modelName}" could not be loaded:`, err.message))
        }
    }
    return mongooseModel
}