import express from "express"
import strategyRouter from "./auth.routes.js"
import adminModel from '../models/admin.model.js'
import { upload } from '../middleware/multer.middleware.js'
import { createCrudController } from "../controllers/crud.controller.js"
import { isAuthenticated } from "../middleware/auth.middleware.js"
import { Login_Auth } from "../config/auth.strategy.js"
import { loadModels } from '../lib/modelLoader.js'
import resources from "../lib/resources.lib.js"
import mongoose from "mongoose"
const router = express.Router()

router.get('/logout', (req, res, next) => strategyRouter.localStrategyLogout)
router.route('/login')
    .get((req, res) => res.render('login', { layout: false, title: 'Login' }))
    .post((req, res, next) => strategyRouter.localStrategy(req, res, next, adminModel))

// router.use(isAuthenticated)
router.get('/', (req, res) => res.render('dashboard', { layout: 'layout', title: 'Dashboard', activePage: 'active' }))


const createCRUDRoutes = async () => {
    const models = await loadModels({ resources })

    for await (const { modelName, model, options, aggregate } of models) {
        const controller = createCrudController(model, options)
        // console.log({ modelName, model, options, aggregate });

        router.get(`/resource/api/${modelName}`, controller.getAllJsonData)
        router.get(`/resources/${modelName}`, async (req, res) => {
            const accept = req.get('Accept')
            return res.render('datatable', {
                title: modelName,
                addURL: `${req.originalUrl}/add`,
                dataTableAPI: `${req.baseUrl}/resource/api/${modelName}`,
                api: req.originalUrl,
                activePage: 'active'
            })
        })
        router.get(`/resources/${modelName}/add`, (req, res) => {
            const userModel = mongoose.model(modelName)
            const fields = Object.entries(userModel.schema.paths)
                .filter(([key]) => !['_id', '__v', 'createdAt', 'updatedAt'].includes(key))
                .map(([key]) => key)  // Get all schema fields 
            console.log(fields);

            return res.render(`${modelName}/create`, {
                title: modelName,
                api: `${req.baseUrl}/resources/${modelName}`,
                fields
            })
        })
        router.post(`/resources/${modelName}`, upload().none(), controller.create)
        router.get(`/resources/${modelName}/:id`, async (req, res) => {
            const response = await model.findById(req.params.id)
            return res.render(`${modelName}/update`, {
                title: modelName,
                api: `${req.baseUrl}/resources/${modelName}`,
                response
            })
        })
        router.put(`/resources/${modelName}/:id`, upload().none(), controller.update)
        router.delete(`/resources/${modelName}/:id`, controller.remove)
    }
}

createCRUDRoutes()
export default router