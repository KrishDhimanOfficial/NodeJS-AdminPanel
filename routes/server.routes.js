import express from "express"
import mongoose from "mongoose"
import adminModel from '../models/admin.model.js'
import CRUD_GENERATOR from "../utils/crudGenerator.utils.js"
import authControllers from "../controllers/auth.controller.js"
import adminPanelController from "../controllers/adminPanel.controller.js"
import setUniversalData from "../middleware/setUniversalData.middleware.js"
import { handlemulterError, upload } from "../middleware/multer.middleware.js"
import { isAuthenticated, isAuthWithAccessCRUD } from "../middleware/auth.middleware.js"
import GenerateCRUDRoutes from "../utils/generateRoutes.utils.js"
import config from "../config/config.js"
import createCrudController from "../controllers/crud.controller.js"
const router = express.Router({ caseSensitive: true, strict: true })

router.get('/logout', (req, res, next) => authControllers.localStrategyLogout(req, res, next))
router.route('/login')
    .get((req, res) => res.render('login', { layout: false, title: 'Login' }))
    .post((req, res, next) => authControllers.localStrategy(req, res, next, adminModel))

// Dashboard
router.get('/', isAuthenticated, setUniversalData, (req, res) => res.status(200).render('dashboard', { title: 'Dashboard' }))

// Admin Profile Routes
router.post('/update/password', isAuthenticated, setUniversalData, adminPanelController.updateAdminPassword)
router.route('/profile')
    .all(isAuthenticated, setUniversalData)
    .get(adminPanelController.renderAdminProfile)
    .post(upload('admin').single('profile'), handlemulterError, adminPanelController.updateAdminProfile)

// Generate CRUD Routes
router.get('/crud', isAuthWithAccessCRUD, setUniversalData, createCrudController().renderCRUD)
router.get('/crud/api', isAuthWithAccessCRUD, createCrudController().getCRUDJsonData)
router.route('/generate-crud')
    .all(isAuthWithAccessCRUD, setUniversalData)
    .get(createCrudController().renderGenerateCRUD)
    .post(upload().none(), (req, res) => CRUD_GENERATOR(req, res))

router.get('/collections', isAuthenticated, (req, res) => res.status(200).json(mongoose.modelNames()));

(
    async () => {
        await mongoose.connect(config.mongodb_URL, { dbName: config.db_name })
        const crudRouter = await GenerateCRUDRoutes()
        router.use('/', crudRouter)
        router.use('/404', isAuthenticated, setUniversalData, (req, res) => res.status(404).render('partials/404'))
        router.use('/*', isAuthenticated, setUniversalData, (req, res) => res.status(404).render('partials/404'))
    }
)(); // IIFE

export default router