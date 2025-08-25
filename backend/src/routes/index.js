const express = require('express')
const authRoutes = require('./auth')
const taskRoutes = require('./tasks')
const commentRoutes = require('./comments')
const notificationRoutes = require('./notifications')
// eslint-disable-next-line no-unused-vars
const { authenticate } = require('../middlewares/auth')

const router = express.Router()

router.use('/auth', authRoutes)
router.use('/tasks', taskRoutes)
router.use('/comments', commentRoutes)
router.use('/notifications', notificationRoutes)

// Ruta para servir archivos subidos
router.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename
  // eslint-disable-next-line no-undef
  res.sendFile(path.join(__dirname, '../../uploads', filename))
})

module.exports = router
