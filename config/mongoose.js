// Include mongoose
const mongoose = require('mongoose')

// setting MONGODB URI (set on heroku) for use (getting data from .env)
const MONGODB_URI = process.env.MONGODB_URI

// setting connection to mongoDB
mongoose.connect(MONGODB_URI)
// getting connection status from database to store in db variable
const db = mongoose.connection

// when database connection's error happens
db.on('error', () => {
  console.log('mongodb error!')
})

// once database connected
db.once('open', () => {
  console.log('mongodb connected')
})

// export (for todoSeeder use db to create data once db opens)
module.exports = db
