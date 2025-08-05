import mongoose from "mongoose"
import path from 'node:path'

export default async function registerModel(modelName) {
    // ✅ Check if the model is already registered
    let mongooseModel;
    if (mongoose.models[modelName]) {
        mongooseModel = mongoose.model(modelName);
    } else {
        // Attempt to load the model file dynamically if not yet registered
        try {
            const modelPath = path.resolve(`./models/${modelName}.model.js`)
            await import(modelPath) // This should register the model
            mongooseModel = mongoose.model(modelName)
        } catch (err) {
            console.error(`❌ Model "${modelName}" could not be loaded:`, err.message)
        }
    }
    return mongooseModel
}