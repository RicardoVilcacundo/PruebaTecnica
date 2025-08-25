const express = require('express')
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  uploadAttachment
} = require('../controllers/taskController')
const { authenticate } = require('../middlewares/auth')
const upload = require('../middlewares/upload')
const router = express.Router()

router.use(authenticate)

router.route('/')
  .post(createTask)
  .get(getTasks)

router.route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(deleteTask)

router.post('/:id/upload', upload.single('attachment'), uploadAttachment)

module.exports = router
