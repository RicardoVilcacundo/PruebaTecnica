const express = require('express')
const { createComment, getComments } = require('../controllers/commentController')
const { authenticate } = require('../middlewares/auth')
const router = express.Router()

router.use(authenticate)

router.route('/:taskId/comments')
  .post(createComment)
  .get(getComments)

module.exports = router
