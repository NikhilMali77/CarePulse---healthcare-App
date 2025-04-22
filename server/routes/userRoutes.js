import express from "express"
import {  createAppointment, getUser, updateUser, userLogin, userSignup } from "../controllers/userController.js"
import {authenticate} from '../config/middleware.js'

const router = express.Router()

router.post('/user-signup', userSignup)
router.post('/user-login', userLogin)
router.get('/:userId', getUser)
router.patch('/update',updateUser)
router.post('/new-appointment', createAppointment)

export default router;