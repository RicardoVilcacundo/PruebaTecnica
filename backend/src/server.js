const express = require('express')
const cors = require('cors')
const path = require('path')
require('dotenv').config()

const { sequelize } = require('./models')
const routes = require('./routes')

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

app.use('/api', routes)

app.get('/', (req, res) => {
  res.json({ message: 'Task Management API is running!' })
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Something went wrong!' })
})

const startServer = async () => {
  try {
    await sequelize.authenticate()
    console.log('Database connected successfully')
    await sequelize.sync({ force: false })
    console.log('Database synchronized')
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Unable to start server:', error)
  }
}

startServer()
