import sturctureModel from "../models/sturcture.model.js"
import createCrudController from "../controllers/crud.controller.js"
import setUniversalData from "../middleware/setUniversalData.middleware.js"
import { handlemulterError, checkSizeLimits, uploadHandler } from "../middleware/multer.middleware.js"
import { isAuthenticated } from "../middleware/auth.middleware.js"
import registerModel from "./registerModel.utils.js"
import { capitalizeFirstLetter } from "captialize"
import express from "express"
const router = express.Router({ caseSensitive: true, strict: true })

const GenerateCRUDRoutes = async () => {
    const resources = await sturctureModel.find({}).lean()

    for await (const { model, fields, uploader, modelDependencies } of resources) {
        // console.log({ model, uploader })
        const modelInstance = await registerModel(model)
        const modelName = modelInstance.modelName;
        const controller = createCrudController(modelInstance, fields, modelDependencies)
        const middlewares = [isAuthenticated, setUniversalData]
        const fileMiddlewares = [isAuthenticated, uploadHandler(uploader), handlemulterError, checkSizeLimits(uploader)]
        const basePath = `/resources/${modelName}`;
        const apiPath = `/resources/api/${modelName}`;

        fields?.length > 0 && fields
            .filter(f => f.display_key && f.form_type === 'select')
            .forEach(({ relation, display_key }) => {
                router.get(`/resources/select/api/${relation}`, // relation : author, category
                    ...middlewares,
                    (req, res) => controller.getSelectJsonData(req, res, relation, display_key)
                )
            })

        // // JSON API routes
        router.get(apiPath, controller.getAllJsonData)
        router.post(basePath, ...fileMiddlewares, controller.create)
        router.put(`${basePath}/:id`, ...fileMiddlewares, controller.update)
        router.patch(`${basePath}/:id`, isAuthenticated, controller.updateModelStatus)
        router.delete(`${basePath}/:id`, isAuthenticated, controller.remove)

        // UI routes
        // View DataTable Page
        router.get(basePath, ...middlewares, (req, res) => {
            return res.status(200).render('datatable', {
                title: capitalizeFirstLetter(`${modelName}s`),
                addURL: `${req.originalUrl}/add`,
                dataTableAPI: `${req.baseUrl}${apiPath}`,
                api: req.originalUrl,
                breadcrumb: [{ name: capitalizeFirstLetter(modelName), active: true, url: `${req.baseUrl}${basePath}` }]
            })
        })

        // View Create Page
        router.get(`${basePath}/add`, ...middlewares, (req, res) => {
            return res.status(200).render(`${modelName}/create`, {
                title: capitalizeFirstLetter(modelName),
                api: `${req.baseUrl}${basePath}`,
                breadcrumb: [{ name: capitalizeFirstLetter(modelName), url: `${req.baseUrl}${basePath}` }, { name: 'Add', active: true }]
            })
        })

        // View Information Page
        router.get(`${basePath}/view/:id`, ...middlewares, controller.getViewInfo)

        // View Update page
        router.get(`${basePath}/:id`, ...middlewares, controller.renderEditPage)
    }
    return router
}

export default GenerateCRUDRoutes