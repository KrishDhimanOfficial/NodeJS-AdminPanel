import express from "express"
import authControllers from "../controllers/auth.controller.js"
const router = express.Router({ strict: true, caseSensitive: true })

router.get('/login', authControllers.handleLogin)
router.get('/logout', authControllers.handleLogout)

export default router