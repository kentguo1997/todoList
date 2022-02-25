// 總路由器 (The controller of all routes) 

// Include Express and Express Router
const express = require('express')
const router = express.Router()
// Include route modules
const home = require('./modules/home')
const todos = require('./modules/todos')
const users = require('./modules/users')


// Include auth middleware for user authentication
const { authenticator } = require('../middleware/auth')



// Include routes

// 將網址結構符合 /todos 字串的 request 導向 todos 模組, 執行modules/todo裡面的程式碼 
router.use('/todos', authenticator, todos)

// 將網址結構符合 /users 字串的 request 導向 users 模組, 執行modules/users裡面的程式碼 
router.use('/users', users)

// 將網址結構符合 / 字串的 request 導向 home 模組, 執行modules/home裡面的程式碼 
router.use('/', authenticator, home)

// 重點:
// 記得要把 router.use('/') 這種定義寬鬆的路由引到清單最下方，避免攔截到其他的路由。



// Export routes for controller use
module.exports = router




