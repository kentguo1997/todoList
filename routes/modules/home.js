// Browse all todos on index page ('/')

// Include Express and Express Router
const express = require('express')
const router = express.Router()
// Include Todo model
const Todo  = require('../../models/todo')


// Define route of homepage
router.get('/', (req, res) => {
  Todo.find()
    .lean()
    .sort({ _id: 'asc' }) //根據每筆資料的_id(資料庫依據資料存入的資料庫的時間先後而幫忙自動產生的)屬性進行升冪排序
    .then(todos => res.render('index', { todos }))
    .catch(error => console.error(error))
})


// Export module
module.exports = router



// 程式碼重點:
// 每個用 . 串接的方法都是按順序進行，一個步驟完成以後才會進入下一步，除非遇到錯誤才會跳到 .catch。
// Todo.find() : 取出 Todo model 裡的所有資料，現在沒有傳入任何參數，所以會撈出整份資料。((這個 Todo 是 model 來的，而 model 又是 Mongoose 提供的，也就是說，Todo 能用的操作方法都來自 Mongoose，以後如果改裝別的資料庫，就會換一套操作方法。))
// .lean() : 把 Mongoose 的 Model 物件轉換成乾淨的 JavaScript 資料陣列，這裡可以記一個口訣：「撈資料以後想用 res.render()，要先用 .lean() 來處理」。
// .then() : 到了 .then() 這一步資料(已被lean轉換後的js乾淨資料陣列)會被放進 todos 變數，你就可以用 res.render('index', { todos }) 把資料傳給 index 樣板。這裡 { todos } 是 { todos: todos } 的縮寫。
// .catch(): 錯誤處理，如果有錯誤的話先把錯誤內容印出來。
// 補充: 這種有 .then().catch() 出現的實作方法叫做 Promise，是 ES6 之後因應 JavaScript 的非同步特性 (不按順序發生) 而發展出的改良寫法，在這種寫法裡你可以從文件上直接看出明顯的先後順序。(在這個作法出現前，我們通常用 callback 來控制先後順序，就像我們在做 DOM 的事件處理時，一個函式做完以後，再把另一個 callback 函式當成參數傳進來，表示下一個動作。相比起來，以前的 callback 作法就要花點精力才能看出程式碼的執行順序，所以在 ES6 做了改良。)