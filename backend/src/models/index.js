const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const bcrypt = require('bcryptjs')

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user'
  }
}, {
  hooks: {
    beforeSave: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10)
      }
    }
  }
})

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  status: {
    type: DataTypes.ENUM('pendiente', 'en progreso', 'completada'),
    defaultValue: 'pendiente'
  },
  dueDate: {
    type: DataTypes.DATE
  },
  attachment: {
    type: DataTypes.STRING
  }
})

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  }
})

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
})

// Definir relaciones
User.hasMany(Task, { foreignKey: 'userId' })
Task.belongsTo(User, { foreignKey: 'userId' })

Task.hasMany(Comment, { foreignKey: 'taskId' })
Comment.belongsTo(Task, { foreignKey: 'taskId' })

User.hasMany(Comment, { foreignKey: 'userId' })
Comment.belongsTo(User, { foreignKey: 'userId' })

Task.hasMany(Notification, { foreignKey: 'taskId' })
Notification.belongsTo(Task, { foreignKey: 'taskId' })

User.hasMany(Notification, { foreignKey: 'userId' })
Notification.belongsTo(User, { foreignKey: 'userId' })

module.exports = {
  User,
  Task,
  Comment,
  Notification,
  sequelize
}

// Añadir esto al modelo User
User.prototype.validPassword = function (password) {
  return bcrypt.compare(password, this.password)
}
