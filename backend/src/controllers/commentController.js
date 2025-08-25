const { Comment, Task, Notification, User } = require('../models')
const Joi = require('joi')

const commentSchema = Joi.object({
  content: Joi.string().required().min(1)
})

exports.createComment = async (req, res) => {
  try {
    const { error } = commentSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ message: error.details[0].message })
    }

    const task = await Task.findByPk(req.params.taskId)
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    // Verificar permisos
    if (req.user.role !== 'admin' && task.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' })
    }

    const comment = await Comment.create({
      content: req.body.content,
      taskId: req.params.taskId,
      userId: req.user.id
    })

    // Crear notificación
    await Notification.create({
      message: `Nuevo comentario en la tarea "${task.title}"`,
      type: 'comment_added',
      taskId: task.id,
      userId: req.user.id
    })

    res.status(201).json(comment)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

exports.getComments = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.taskId)
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    // Verificar permisos
    if (req.user.role !== 'admin' && task.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' })
    }

    const comments = await Comment.findAll({
      where: { taskId: req.params.taskId },
      include: [{
        // eslint-disable-next-line no-undef
        model: User,
        attributes: ['id', 'username', 'email']
      }],
      order: [['createdAt', 'DESC']]
    })

    res.json(comments)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}
