// 總路由器 (The controller of all routes) 

// Include Express and Express Router
const express = require('express')
const router = express.Router()
// Include route modules
const home = require('./modules/home')
const todos = require('./modules/todos')
const users = require('./modules/users')


// Include routes

// Homepage
// 將網址結構符合 / 字串的 request 導向 home 模組, 執行modules/home裡面的程式碼 
router.use('/', home)
// 將網址結構符合 /todos 字串的 request 導向 todos 模組, 執行modules/todo裡面的程式碼 
router.use('/todos', todos)
// 將網址結構符合 /users 字串的 request 導向 users 模組, 執行modules/users裡面的程式碼 
router.use('/users', users)

// Export routes for controller use
module.exports = router




