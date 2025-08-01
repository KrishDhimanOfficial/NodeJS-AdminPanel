import sturctureModel from "../models/sturcture.model.js"
import createCrudController from "../controllers/crud.controller.js"
import path from 'node:path'
import mongoose from "mongoose"
import setUniversalData from "../middleware/setUniversalData.middleware.js"
import { handlemulterError, upload } from "../middleware/multer.middleware.js"
import { isAuthenticated } from "../middleware/auth.middleware.js"
import resources from "../lib/resources.lib.js"
import { capitalizeFirstLetter } from "captialize"
const validateId = mongoose.Types.ObjectId.isValid;

const GenerateCRUDRoutes = async (router) => {
    // const reso = await sturctureModel.find({}).lean()

    for await (const { model, options, aggregate, multer, select2 } of resources) {
        // console.log({ model, options })
        const modelName = model.modelName;
        const controller = createCrudController(model, options, aggregate)
        const middlewares = [isAuthenticated, setUniversalData]
        const basePath = `/resources/${modelName}`;
        const apiPath = `/resources/api/${modelName}`;

        select2?.length > 0 && select2.forEach(option => {
            router.get(`/resources/select/api/${option.model.modelName}`,
                ...middlewares,
                (req, res) => controller.getSelectJsonData(req, res, option)
            )
        })

        // JSON API routes
        router.get(apiPath, isAuthenticated, controller.getAllJsonData)
        router.post(basePath, isAuthenticated, multer(), handlemulterError, controller.create)
        router.put(`${basePath}/:id`, isAuthenticated, multer(), handlemulterError, controller.update)
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
}

export default GenerateCRUDRoutes

// ✅ Check if the model is already registered
// let mongooseModel;
// if (mongoose.models[modelName]) {
//     mongooseModel = mongoose.model(modelName);
// } else {
//     // Attempt to load the model file dynamically if not yet registered
//     try {
//         const modelPath = path.resolve(`./models/${modelName}.model.js`)
//         await import(modelPath) // This should register the model
//         mongooseModel = mongoose.model(modelName)
//     } catch (err) {
//         console.error(`❌ Model "${modelName}" could not be loaded:`, err.message)
//         continue;
//     }
// }