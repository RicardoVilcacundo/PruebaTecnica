const { Task, User, Comment, Notification } = require('../models')
const Joi = require('joi')

const taskSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow(''),
  status: Joi.string().valid('pendiente', 'en progreso', 'completada'),
  dueDate: Joi.date().iso(),
  userId: Joi.number().integer()
})

exports.createTask = async (req, res) => {
  try {
    const { error } = taskSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ message: error.details[0].message })
    }

    const taskData = {
      ...req.body,
      userId: req.body.userId || req.user.id
    }

    const task = await Task.create(taskData)

    // Crear notificación
    await Notification.create({
      message: `Tarea "${task.title}" creada`,
      type: 'task_created',
      taskId: task.id,
      userId: req.user.id
    })

    res.status(201).json(task)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

exports.getTasks = async (req, res) => {
  try {
    const { status, userId } = req.query
    const whereClause = {}
    // Si no es admin, solo ver sus tareas
    if (req.user.role !== 'admin') {
      whereClause.userId = req.user.id
    } else if (userId) {
      whereClause.userId = userId
    }
    if (status) {
      whereClause.status = status
    }

    const tasks = await Task.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'email']
        },
        {
          model: Comment,
          include: [User]
        }
      ],
      order: [['createdAt', 'DESC']]
    })

    res.json(tasks)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

exports.getTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'email']
        },
        {
          model: Comment,
          include: [User]
        }
      ]
    })

    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    // Verificar permisos
    if (req.user.role !== 'admin' && task.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' })
    }

    res.json(task)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

exports.updateTask = async (req, res) => {
  try {
    const { error } = taskSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ message: error.details[0].message })
    }

    const task = await Task.findByPk(req.params.id)
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    // Verificar permisos
    if (req.user.role !== 'admin' && task.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' })
    }

    const oldStatus = task.status
    await task.update(req.body)

    // Crear notificación si cambió el estado
    if (req.body.status && req.body.status !== oldStatus) {
      await Notification.create({
        message: `Tarea "${task.title}" cambió de estado a ${req.body.status}`,
        type: 'status_changed',
        taskId: task.id,
        userId: req.user.id
      })
    }

    res.json(task)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id)
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    // Verificar permisos
    if (req.user.role !== 'admin' && task.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' })
    }

    await task.destroy()

    res.json({ message: 'Task deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

exports.uploadAttachment = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const task = await Task.findByPk(req.params.id)
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    // Verificar permisos
    if (req.user.role !== 'admin' && task.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' })
    }

    task.attachment = req.file.filename
    await task.save()

    res.json({ message: 'File uploaded successfully', filename: req.file.filename })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}
