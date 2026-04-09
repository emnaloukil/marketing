const mongoose = require('mongoose')

const connectDB = async () => {
  console.log('DB: trying to connect...')
  console.log(
    'DB URI host =',
    process.env.MONGODB_URI?.replace(/\/\/.*:.*@/, '//***:***@')
  )

  const conn = await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
  })

  console.log(`✅ MongoDB connected: ${conn.connection.host}`)
  return conn
}

module.exports = connectDB