const { Notification } = require('../models')

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 20
    })

    res.json(notifications)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id)
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' })
    }

    // Verificar permisos
    if (notification.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' })
    }

    notification.isRead = true
    await notification.save()

    res.json({ message: 'Notification marked as read' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}
