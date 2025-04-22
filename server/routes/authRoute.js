import express from 'express'
import { checkAuth, checkDocAuth } from '../controllers/authController.js'
import { ensureAuthenticated } from '../config/middleware.js'
const router = express.Router()

router.get('/check', checkAuth)
router.get('/check-doc-auth', checkDocAuth)

export default router