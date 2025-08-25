const express = require('express')
const { getNotifications, markAsRead } = require('../controllers/notificationController')
const { authenticate } = require('../middlewares/auth')
const router = express.Router()

router.use(authenticate)

router.get('/', getNotifications)
router.put('/:id/read', markAsRead)

module.exports = router
