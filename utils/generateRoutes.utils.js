import sturctureModel from "../models/sturcture.model.js"
import createCrudController from "../controllers/crud.controller.js"
import path from 'node:path'
import mongoose from "mongoose"
import setUniversalData from "../middleware/setUniversalData.middleware.js"
import { handlemulterError, upload } from "../middleware/multer.middleware.js"
import { isAuthenticated } from "../middleware/auth.middleware.js"
import multerUploader from "../utils/multerUploader.utils.js"
// import resources from "../lib/resources.lib.js"
import { capitalizeFirstLetter } from "captialize"
import express from "express"
const router = express.Router({ caseSensitive: true, strict: true })
const validateId = mongoose.Types.ObjectId.isValid;

const GenerateCRUDRoutes = async () => {
    if (mongoose.connection.readyState !== 1) throw new Error("Mongoose is not connected")

    const resources = await sturctureModel.find({}).lean()

    for await (const { model, options, aggregate, uploader, select2 } of resources) {
        // console.log({ model, options, uploader })
        const modelInstance = await registerModel(model)
        const modelName = modelInstance.modelName;
        const controller = createCrudController(modelInstance, options, aggregate)
        const middlewares = [isAuthenticated, setUniversalData]
        const basePath = `/resources/${modelName}`;
        const apiPath = `/resources/api/${modelName}`;

        select2?.length > 0 && select2.forEach(option => {
            router.get(`/resources/select/api/${option.model.modelName}`,
                ...middlewares,
                (req, res) => controller.getSelectJsonData(req, res, option)
            )
        })

        // // JSON API routes
        router.get(apiPath, isAuthenticated, controller.getAllJsonData)
        router.post(basePath, isAuthenticated, multerUploader(uploader), handlemulterError, controller.create)
        router.put(`${basePath}/:id`, isAuthenticated, handlemulterError, controller.update)
        router.patch(`${basePath}/:id`, isAuthenticated, controller.updateModelStatus)
        router.delete(`${basePath}/:id`, isAuthenticated, controller.remove)

        // UI routes
        router.get(basePath, ...middlewares, (req, res) => {
            return res.status(200).render('datatable', {
                title: capitalizeFirstLetter(modelName),
                addURL: `${req.originalUrl}/add`,
                dataTableAPI: `${req.baseUrl}${apiPath}`,
                api: req.originalUrl,
            })
        }) // View DataTable Page

        router.get(`${basePath}/add`, ...middlewares, (req, res) => {
            return res.status(200).render(`${modelName}/create`, {
                title: capitalizeFirstLetter(modelName),
                api: `${req.baseUrl}${basePath}`,
            })
        }) // View Create Page

        router.get(`${basePath}/view/:id`, ...middlewares, async (req, res) => {
            if (!validateId(req.params.id)) return res.status(400).redirect(`${req.baseUrl}/404`)
            const response = await model.findById({ _id: req.params.id })

            return res.status(200).render(`${model.modelName}/view`, { response })
        }) // View Information Page

        router.get(`${basePath}/:id`, ...middlewares, async (req, res) => {
            if (!validateId(req.params.id)) return res.status(400).redirect(`${req.baseUrl}/404`)
            const response = await model.findById(req.params.id)

            return res.status(200).render(`${modelName}/update`, {
                title: capitalizeFirstLetter(modelName),
                api: `${req.baseUrl}${basePath}`,
                response,
            })
        }) // View Update page
    }
    return router
}

async function registerModel(modelName) {
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

export default GenerateCRUDRoutes