// Include mongoose
const mongoose = require('mongoose')

// setting connection to mongoDB
mongoose.connect('mongodb://localhost/todo_list')
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