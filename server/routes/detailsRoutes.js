import express from "express"
import { adminDetails, createDoctor, userDetails } from "../controllers/detailsController.js"
import {authenticate} from '../config/middleware.js'

const router = express.Router()

router.post('/user', authenticate, userDetails)
router.post('/admin', adminDetails)
router.post('/doctor', createDoctor)

export default router;