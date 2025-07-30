import express from "express"
import mongoose from "mongoose"
import resources from "../lib/resources.lib.js"
import adminModel from '../models/admin.model.js'
import CRUD_GENERATOR from "../utils/crudGenerator.utils.js"
import authControllers from "../controllers/auth.controller.js"
import createCrudController from "../controllers/crud.controller.js"
import adminPanelController from "../controllers/adminPanel.controller.js"
import setUniversalData from "../middleware/setUniversalData.middleware.js"
import { handlemulterError, upload } from "../middleware/multer.middleware.js"
import { isAuthenticated, isAuthWithAccessCRUD } from "../middleware/auth.middleware.js"
const router = express.Router({ caseSensitive: true, strict: true })

router.get('/logout', (req, res, next) => authControllers.localStrategyLogout(req, res, next))
router.route('/login')
    .get((req, res) => res.render('login', { layout: false, title: 'Login' }))
    .post(async (req, res, next) => authControllers.localStrategy(req, res, next, adminModel))

// Dashboard
router.get('/', isAuthenticated, setUniversalData, (req, res) => res.status(200).render('dashboard', { title: 'Dashboard' }))

// Admin Profile Routes
router.post('/update/password', isAuthenticated, setUniversalData, adminPanelController.updateAdminPassword)
router.route('/profile')
    .all(isAuthenticated, setUniversalData)
    .get(adminPanelController.renderAdminProfile)
    .post(upload('admin').single('profile'), handlemulterError, adminPanelController.updateAdminProfile)

// Generate CRUD Routes
router.get('/crud', isAuthWithAccessCRUD, setUniversalData, adminPanelController.renderCRUD)
router.route('/generate-crud')
    .all(isAuthWithAccessCRUD, setUniversalData)
    .get(adminPanelController.renderGenerateCRUD)
    .post(upload().none(), (req, res) => CRUD_GENERATOR(req, res))

router.get('/collections', isAuthenticated, setUniversalData, (req, res) => res.status(200).json(mongoose.modelNames()))

for await (const { model, options, aggregate, multer, select2 } of resources) {
    // console.log({modelName, model, options, aggregate, multer, select2 })
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
    router.get(apiPath, ...middlewares, controller.getAllJsonData)
    router.get(`${basePath}/view/:id`, ...middlewares, controller.getViewInfo)
    router.post(basePath, ...middlewares, multer(), handlemulterError, controller.create)
    router.put(`${basePath}/:id`, ...middlewares, multer(), handlemulterError, controller.update)
    router.patch(`${basePath}/:id`, ...middlewares, controller.updateModelStatus)
    router.delete(`${basePath}/:id`, ...middlewares, controller.remove)

    // UI routes
    router.get(basePath, ...middlewares, (req, res) => {
        return res.status(200).render('datatable', {
            title: modelName,
            addURL: `${req.originalUrl}/add`,
            dataTableAPI: `${req.baseUrl}${apiPath}`,
            api: req.originalUrl,
        })
    })

    router.get(`${basePath}/add`, ...middlewares, (req, res) => {
        return res.status(200).render(`${modelName}/create`, {
            title: modelName,
            api: `${req.baseUrl}${basePath}`,
        })
    })

    router.get(`${basePath}/:id`, ...middlewares, async (req, res) => {
        const response = await model.findById(req.params.id)
        return res.status(200).render(`${modelName}/update`, {
            title: modelName,
            api: `${req.baseUrl}${basePath}`,
            response,
        })
    })
}

router.use('/*', isAuthenticated, setUniversalData, (req, res) => res.status(404).render('partials/404'))
export default router