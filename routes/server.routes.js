import express from "express"
import adminModel from '../models/admin.model.js'
import { createCrudController } from "../controllers/crud.controller.js"
import { isAuthenticated } from "../middleware/auth.middleware.js"
import loadModels from '../utils/modelLoader.utils.js'
import resources from "../lib/resources.lib.js"
import mongoose from "mongoose"
import adminPanelController from "../controllers/adminPanel.controller.js"
import authControllers from "../controllers/auth.controller.js"
import { handlemulterError, upload } from "../middleware/multer.middleware.js"
import CRUD_GENERATOR from "../utils/crudGenerator.utils.js"
const router = express.Router({ caseSensitive: true, strict: true })

router.get('/logout', (req, res, next) => authControllers.localStrategyLogout(req, res, next))
router.route('/login')
    .get((req, res) => res.render('login', { layout: false, title: 'Login' }))
    .post(async (req, res, next) => authControllers.localStrategy(req, res, next, adminModel))

router.use((req, res, next) => {
    res.locals.baseUrl = req.baseUrl
    req.user && (res.locals.admin = req.user)
    res.locals.navigation = resources
        .filter(resource => resource.navigation !== undefined)
        .map(resource => resource.navigation)
    next()
})

router.get('/', isAuthenticated, (req, res) => res.status(200).render('dashboard', { layout: 'layout', title: 'Dashboard', admin: req.user }))

// Admin Profile Routes
router.post('/update/password', isAuthenticated, adminPanelController.updateAdminPassword)
router.route('/profile')
    .all(isAuthenticated)
    .get(adminPanelController.renderAdminProfile)
    .post(upload('admin').single('profile'), handlemulterError, adminPanelController.updateAdminProfile)

// Generate CRUD Routes
router.route('/generate-crud')
    .all(isAuthenticated)
    .get(adminPanelController.renderGenerateCRUD)
    .post(upload().none(), (req, res) => CRUD_GENERATOR(req, res))

// const createCRUDRoutes = async () => {
// const models = await loadModels({ resources })
for await (const { model, options, aggregate, multer, select2 } of resources) {
    // console.log({ model, options, aggregate, multer, select2 })
    const modelName = model.modelName;
    // console.log(modelName);

    const controller = createCrudController(model, options, aggregate)

    select2?.length > 0 && select2.forEach(option => {
        router.get(`/resources/select/api/${option.model.modelName}`, isAuthenticated, (req, res) => controller.getSelectJsonData(req, res, option))
    })
    router.get(`/resources/api/${modelName}`, isAuthenticated, controller.getAllJsonData)
    router.get(`/resources/${modelName}/view/:id`, isAuthenticated, controller.getViewInfo)
    router.post(`/resources/${modelName}`, isAuthenticated, multer(), handlemulterError, controller.create)
    router.put(`/resources/${modelName}/:id`, isAuthenticated, multer(), handlemulterError, controller.update)
    router.patch(`/resources/${modelName}/:id`, isAuthenticated, controller.updateModelStatus)
    router.delete(`/resources/${modelName}/:id`, isAuthenticated, controller.remove)
    router.get(`/resources/${modelName}`, isAuthenticated, (req, res) => {
        return res.status(200).render('datatable', {
            title: modelName,
            addURL: `${req.originalUrl}/add`,
            dataTableAPI: `${req.baseUrl}/resources/api/${modelName}`,
            api: req.originalUrl,
        })
    })
    router.get(`/resources/${modelName}/add`, isAuthenticated, (req, res) => {
        return res.status(200).render(`${modelName}/create`, {
            title: modelName,
            api: `${req.baseUrl}/resources/${modelName}`,
        })
    })
    router.get(`/resources/${modelName}/:id`, isAuthenticated, async (req, res) => {
        const response = await model.findById(req.params.id)
        return res.status(200).render(`${modelName}/update`, {
            title: modelName,
            api: `${req.baseUrl}/resources/${modelName}`,
            response,
        })
    })
}
// }

// createCRUDRoutes()
router.use('/*', (req, res) => {
    return res.status(404).render('partials/404')
})
export default router