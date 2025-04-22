import express from 'express'
import { addDocBlog, deleteBlog, doctorLogin, editBlog, fetchBlogById, fetchBlogs, getDoctor } from '../controllers/doctorController.js'
const router = express.Router()

router.post('/login', doctorLogin)
router.get('/all-blogs', fetchBlogs)
router.get('/blog/:blogId',fetchBlogById )
router.get('/:doctorId', getDoctor)
router.post('/add-blog', addDocBlog)
router.put('/edit-blog/:blogId', editBlog)
router.delete('/delete-blog/:blogId', deleteBlog)

export default router;