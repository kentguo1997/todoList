// Build userSchema based on register page

// Include mongoose
const mongoose = require('mongoose')
const Schema = mongoose.Schema


// setting Schema
const userSchema = new Schema({
  name: {
    type: String,
    required: true
  }, 
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true  
  }, 
  createdAt: {
    type: Date,
    default: Date.now
  }
})


// export
module.exports = mongoose.model('User', userSchema) 