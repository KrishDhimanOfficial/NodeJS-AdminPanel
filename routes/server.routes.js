import express from "express"
import adminModel from '../models/admin.model.js'
import { createCrudController } from "../controllers/crud.controller.js"
import { isAuthenticated } from "../middleware/auth.middleware.js"
import { loadModels } from '../lib/modelLoader.js'
import resources from "../lib/resources.lib.js"
import mongoose from "mongoose"
import adminPanelController from "../controllers/adminPanel.controller.js"
import authControllers from "../controllers/auth.controller.js"
import { handlemulterError, upload } from "../middleware/multer.middleware.js"
const router = express.Router()

router.get('/logout', (req, res, next) => authControllers.localStrategyLogout(req, res, next))
router.route('/login')
    .get((req, res) => res.render('login', { layout: false, title: 'Login' }))
    .post(async (req, res, next) => authControllers.localStrategy(req, res, next, adminModel))

router.use((req, res, next) => {
    res.locals.baseUrl = req.baseUrl
    res.locals.navigation = resources
        .filter(resource => resource.navigation !== undefined)
        .map(resource => resource.navigation)
    next()
})

router.use(isAuthenticated)
router.get('/', (req, res) => res.status(200).render('dashboard', { layout: 'layout', title: 'Dashboard' }))
router.post('/update/password', adminPanelController.updateAdminPassword)
router.route('/profile')
    .get(adminPanelController.renderAdminProfile)
    .post(upload('admin').single('profile'), handlemulterError, adminPanelController.updateAdminProfile)

const createCRUDRoutes = async () => {
    const models = await loadModels({ resources })

    for await (const { modelName, model, options, aggregate, multer } of models) {

        const controller = createCrudController(model, options, aggregate)
        // console.log({ modelName, model, options, aggregate });

        router.get(`/resources/api/${modelName}`, controller.getAllJsonData)
        router.get(`/resources/${modelName}`, async (req, res) => {
            // const accept = req.get('Accept')
            return res.render('datatable', {
                title: modelName,
                addURL: `${req.originalUrl}/add`,
                dataTableAPI: `${req.baseUrl}/resources/api/${modelName}`,
                api: req.originalUrl,
                admin: req.user
            })
        })
        router.get(`/resources/${modelName}/add`, (req, res) => {
            const userModel = mongoose.model(modelName)
            const fields = Object.entries(userModel.schema.paths)
                .filter(([key]) => !['_id', '__v', 'createdAt', 'updatedAt'].includes(key))
                .map(([key]) => key)  // Get all schema fields 

            return res.render(`${modelName}/create`, {
                title: modelName,
                api: `${req.baseUrl}/resources/${modelName}`,
                fields
            })
        })
        router.post(`/resources/${modelName}`, multer(), handlemulterError, controller.create)
        router.get(`/resources/${modelName}/:id`, async (req, res) => {
            const response = await model.findById(req.params.id)
            return res.render(`${modelName}/update`, {
                title: modelName,
                api: `${req.baseUrl}/resources/${modelName}`,
                response
            })
        })
        router.put(`/resources/${modelName}/:id`, multer(), controller.update)
        router.patch(`/resources/${modelName}/:id`, multer(), controller.updateModelStatus)
        router.delete(`/resources/${modelName}/:id`, controller.remove)
    }
}

createCRUDRoutes()
export default router