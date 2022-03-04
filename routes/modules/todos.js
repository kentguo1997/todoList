// '/todos' related routes

// Include Express and Express Router
const express = require('express')
const router = express.Router()
// Include Todo model
const Todo = require('../../models/todo')

// Define routes('/todos')
// 注意: 因為'/todos'的路由結構是重複的, 且已經在index.js當中設定針對'/todos'路由的處理了, 所以只需要寫出/todos之後的路由出來就可以了

// adding new to-do
router.get('/new', (req, res) => {
  return res.render('new')
})

// CRUD中的C (Create)
// new.hbs中的form action="/todos" method="POST"的路由
router.post('/', (req, res) => {
  const name = req.body.name
  const userId = req.user._id

  return Todo.create({ name, userId })
    .then(() => res.redirect('/')) // 新增完成後導回首頁
    .catch(error => console.error(error))
})

// 取代Todo.create({ name: name })的另一種寫法:
// const todo = new Todo({ name: name }) 從Todo產生一個實例
// return todo.save() 將該實例存入資料庫
// 兩者的意義不太一樣，不過就「新增一筆資料」來說，都會達成相同結果。這裡我們最後選用作法一，因為看起來步驟比較少。後面「編輯資料」時就必須要採用作法二，我們之後再討論。

// Edit any of todos
router.get('/:id/edit', (req, res) => {
  const _id = req.params.id
  const userId = req.user._id

  return Todo.findOne({ _id, userId })
    .lean()
    .then(todo => res.render('edit', { todo }))
    .catch(error => console.log(error))

  // 重點: (加入userId 的關聯對應之後)

  // 要把原本的 Todo.findById(id) 改成 Todo.findOne({ _id, userId })，才能串接多個條件。(改用 findOne 之後，Mongoose 就不會自動幫我們轉換 id 和 _id，所以這裡要寫和資料庫一樣的屬性名稱，也就是 _id。)
  // 邏輯解析: 先找出_id一樣的todo, 確保這筆todo屬於目前登入的user(double check的概念) 這樣就會找出「_id 和網址參數一樣，而且屬於目前登入使用者的 todo」。
})

// 首先要用 req.params.id 把網址上的 id 截取出來，有了 id 之後，就能使用 Todo.findById() 來查詢資料庫。找出資料以後，因為要傳給前端樣板，記得加上 .lean()。若成功找到資料，就把資料傳給 view 引擎，並且指定使用 edit 樣板，view 引擎就能幫我們組合出「帶有資料的 HTML 樣板」。

// CRUD 的 Update的動作 (暫時使用post來做)
router.put('/:id', (req, res) => {
  const _id = req.params.id
  const userId = req.user._id

  // 使用者新輸入的資料 (結構賦值)
  // 「解構賦值 (destructuring assignment)」:主要就是想要把物件裡的屬性一項項拿出來存成變數時，可以使用的一種縮寫：
  const { name, isDone } = req.body

  return Todo.findOne({ _id, userId })
    .then(todo => {
      todo.name = name
      todo.isDone = isDone === 'on'
      // 注意: checkbox的回傳值是由HTML規定的，和直覺想像的 true/false 不太一樣。如果 checkbox 有被打勾，它會被設定為 on; 如果 checkbox 沒有被「打勾」，則它不會帶任何值。

      // 使用 if/else 處理布林值時，多半都可以縮寫，因為條件式本身就回傳布林值。
      // 上述的語法是說若從req.body表單中取出的資料為true(checkbox===on)則就可以將true值賦值給該筆todo的isDone。這樣的寫法可以取代以下的if/else, 讓程式碼更簡潔。
      // if (isDone === 'on') {
      // todo.isDone = true
      //  } else {
      // todo.isDone = false
      // }

      return todo.save()
    })
    .then(() => res.redirect(`/todos/${_id}`))
    .catch(error => console.log(error))
})

// step 1. 這裡 id 和 name 兩種資料都來自客戶端，id 要從網址上用 req.params.id 拿下來，而 name 要用 req.body.name 從表單拿出來。
// step 2. Todo.findById(id) 和 todo.save()。接下來的資料操作我們呼叫了以上兩次資料操作方法，這裡要注意，資料操作是由另一台資料庫伺服器幫忙執行的(透過mongoose的語法呼叫mongodb幫忙做事情)！！只要是請別人做的事情，都會有成功/失敗的狀況。重要: 在流程上，我們需要等待資料庫返回執行結果，才能進行下一個動作，所以這裡有兩段的.then()。任一步驟出現失敗，都會跳進錯誤處理。
// Todo.create() v.s. todo.save() : 前者是操作整份資料，後者是針對單一資料。在「新增資料」時兩種作法都可以，而這次因為搭配的資料操作是 Todo.findById，這個方法只會返回一筆資料，所以後面需要接 todo.save() 針對這一筆資料進行儲存，而非操作整份資料。
// 記住是在res.render的時候要使用.lean(), 上述Updete的情況不需要使用(若使用的話, 反而無法執行接下來的todo.save()指令)

// show details of every to-do
router.get('/:id', (req, res) => {
  const _id = req.params.id
  const userId = req.user._id

  return Todo.findOne({ _id, userId })
    .lean()
    .then(todo => res.render('detail', { todo }))
    .catch(error => console.log(error))
})

// 注意: 記得把show details的路由寫在/todos/new(新增功能的程式碼之後, 不然首頁的新增功能的按鈕會壞掉(/todos/new會被當作/todos/:id進去執行裡面的程式碼))
// 重點:
// 1. 在路由網址如果用了冒號 :，表示這是一個動態參數，可以用 req.params 取出，這裡我們設定 :id，所以就用 req.params.id 拿到資料。
// 2. 這次我們要查詢特定一筆 todo 資料，所以我們的 controller 不是用 Todo.find，而是用 Todo.findById——findById 的直接翻譯就是「以 id 去尋找」。(findById是mongoose 內建的模組方法)
// 注意: findById的方法最後只會回傳資料庫裡符合條件的"那一筆資料"而已(因為資料庫裡的id不會重複)，所以到.then的時候就可以自行設定變數(這裡是設定todo)來存取取出的這筆資料, 然後將設定得參數(todo)代進要渲染的detail.hbs當中

// 3. 這裡撈出來的資料也需要傳給樣板使用，所以要用 lean() 把資料整理乾淨。別忘了我們的口訣：「撈資料以後想用 res.render()，就要先用 .lean()」。
// 4. 到 .then() 這段拿到資料了，資料會被存在 todo 變數裡，傳給樣板引擎，請 Handlebars 幫忙組裝 detail 頁面。

// delete any of id
router.delete('/:id', (req, res) => {
  const _id = req.params.id
  const userId = req.user._id

  return Todo.findOne({ _id, userId })
    .then(todo => todo.remove())
    .then(() => res.redirect('/'))
    .catch(error => console.log(error))
})

// step 1. 透過 req.params.id 取得網址上的識別碼，用來查詢使用者想刪除的 To-do。
// step 2. 使用 Todo.findById 查詢資料，資料庫查詢成功以後，會把資料放進 todo。
// step 3. 用 todo.remove() 刪除這筆資料。
// step 4. 成功刪除以後，使用 redirect 重新呼叫首頁，此時會重新發送請求給 GET /，進入到另一條路由。

// Export module
module.exports = router
