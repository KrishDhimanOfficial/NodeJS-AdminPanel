import sturctureModel from "../models/sturcture.model.js"
import createCrudController from "../controllers/crud.controller.js"
import path from 'node:path'
import mongoose from "mongoose"
import setUniversalData from "../middleware/setUniversalData.middleware.js"
import { handlemulterError, checkSizeLimits, multerUploader } from "../middleware/multer.middleware.js"
import { isAuthenticated } from "../middleware/auth.middleware.js"
// import resources from "../lib/resources.lib.js"
import registerModel from "./registerModel.utils.js"
import { capitalizeFirstLetter } from "captialize"
import express from "express"
const router = express.Router({ caseSensitive: true, strict: true })
const validateId = mongoose.Types.ObjectId.isValid;

const GenerateCRUDRoutes = async () => {
    if (mongoose.connection.readyState !== 1) throw new Error("Mongoose is not connected")

    const resources = await sturctureModel.find({}).lean()

    for await (const { model, fields, uploader, navigation, modeldependenices } of resources) {
        // console.log({ model, options, uploader })
        const modelInstance = await registerModel(model)
        const modelName = modelInstance.modelName;
        const controller = createCrudController(modelInstance, fields)
        const middlewares = [isAuthenticated, setUniversalData]
        const fileMiddlewares = [isAuthenticated, multerUploader(uploader), handlemulterError, checkSizeLimits(uploader)]
        const basePath = `/resources/${modelName}`;
        const apiPath = `/resources/api/${modelName}`;

        modeldependenices?.length > 0 && modeldependenices.forEach(modelName => {
            router.get(`/resources/select/api/${modelName}`,
                ...middlewares,
                (req, res) => controller.getSelectJsonData(req, res, modelName)
            )
        })

        // // JSON API routes
        router.get(apiPath, controller.getAllJsonData)
        router.post(basePath, ...fileMiddlewares, controller.create)
        router.put(`${basePath}/:id`, ...fileMiddlewares, controller.update)
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
            const response = await modelInstance.findById({ _id: req.params.id })

            return res.status(200).render(`${model.modelName}/view`, { response })
        }) // View Information Page

        router.get(`${basePath}/:id`, ...middlewares, controller.getOne) // View Update page
    }
    return router
}

export default GenerateCRUDRoutes