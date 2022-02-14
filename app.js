// app.js 就是扮演controller的角色 (Controller 是統一中控台，從程式外部發進來的請求一律交給 controller，由 controller 來進行內部聯繫，也就是負責串連 model 和 view。)
// Include packages in the file
const express = require('express')
const app = express()
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const Todo = require('./models/todo') // Include Todo model
const todo = require('./models/todo')
const port = 3000

// setting template engine
// 建立一個名為hbs的樣板引擎, 並傳入exphbs與相關參數
// 呼叫 exphbs 的時候，除了設定預設樣板，還多了一組設定 extname: '.hbs'，是指定副檔名為 .hbs，有了這行以後，我們才能把預設的長檔名改寫成短檔名。
app.engine('hbs', exphbs({ defaultLayout: 'main', extname: '.hbs'}))
// 開始啟用樣板引擎hbs
app.set('view engine', 'hbs')


// setting body-parser for showing properties of req.body
app.use(bodyParser.urlencoded({ extended: true }))


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


// setting routes
// browse all todos on index page
app.get('/', (req, res) => {
  Todo.find()
    .lean()
    .sort({ _id: 'asc' }) //根據每筆資料的_id(資料庫依據資料存入的資料庫的時間先後而幫忙自動產生的)屬性進行升冪排序
    .then(todos => res.render('index', { todos }))
    .catch(error => console.error(error))
})

// 每個用 . 串接的方法都是按順序進行，一個步驟完成以後才會進入下一步，除非遇到錯誤才會跳到 .catch。
// Todo.find() : 取出 Todo model 裡的所有資料，現在沒有傳入任何參數，所以會撈出整份資料。((這個 Todo 是 model 來的，而 model 又是 Mongoose 提供的，也就是說，Todo 能用的操作方法都來自 Mongoose，以後如果改裝別的資料庫，就會換一套操作方法。))
// .lean() : 把 Mongoose 的 Model 物件轉換成乾淨的 JavaScript 資料陣列，這裡可以記一個口訣：「撈資料以後想用 res.render()，要先用 .lean() 來處理」。
// .then() : 到了 .then() 這一步資料(已被lean轉換後的js乾淨資料陣列)會被放進 todos 變數，你就可以用 res.render('index', { todos }) 把資料傳給 index 樣板。這裡 { todos } 是 { todos: todos } 的縮寫。
// .catch(): 錯誤處理，如果有錯誤的話先把錯誤內容印出來。
// 補充: 這種有 .then().catch() 出現的實作方法叫做 Promise，是 ES6 之後因應 JavaScript 的非同步特性 (不按順序發生) 而發展出的改良寫法，在這種寫法裡你可以從文件上直接看出明顯的先後順序。(在這個作法出現前，我們通常用 callback 來控制先後順序，就像我們在做 DOM 的事件處理時，一個函式做完以後，再把另一個 callback 函式當成參數傳進來，表示下一個動作。相比起來，以前的 callback 作法就要花點精力才能看出程式碼的執行順序，所以在 ES6 做了改良。)


// adding new to-do
app.get('/todos/new', (req, res) => {
  return res.render('new')
})

// CRUD中的C (Create)
// new.hbs中的form action="/todos" method="POST"的路由
app.post('/todos', (req, res) => {
  const name = req.body.name   // 從 req.body 拿出表單裡的 name 資料(這些屬性名稱 (e.g. name) 是跟著 <input> 框籤上的 name 屬性。)
  return Todo.create({ name: name }) // 呼叫Todo物件, 將括弧中的參數傳入直接新增一筆資料
    .then(() => res.redirect('/')) // 新增完成後導回首頁
    .catch(error => console.error(error))
})

// 取代Todo.create({ name: name })的另一種寫法:
// const todo = new Todo({ name: name }) 從Todo產生一個實例
// return todo.save() 將該實例存入資料庫
// 兩者的意義不太一樣，不過就「新增一筆資料」來說，都會達成相同結果。這裡我們最後選用作法一，因為看起來步驟比較少。後面「編輯資料」時就必須要採用作法二，我們之後再討論。



// Edit any of todos
app.get('/todos/:id/edit', (req, res) => {
  const id = req.params.id
  return Todo.findById(id)
    .lean()
    .then(todo => res.render('edit', { todo }))
    .catch(error => console.log(error))
})


// 首先要用 req.params.id 把網址上的 id 截取出來，有了 id 之後，就能使用 Todo.findById() 來查詢資料庫。找出資料以後，因為要傳給前端樣板，記得加上 .lean()。若成功找到資料，就把資料傳給 view 引擎，並且指定使用 edit 樣板，view 引擎就能幫我們組合出「帶有資料的 HTML 樣板」。


// CRUD 的 Update的動作 (暫時使用post來做)
app.post('/todos/:id/edit', (req, res) => {
  const id = req.params.id

   // 使用者新輸入的資料 (結構賦值)
   // 「解構賦值 (destructuring assignment)」:主要就是想要把物件裡的屬性一項項拿出來存成變數時，可以使用的一種縮寫：
  const { name, isDone } = req.body
  
  return Todo.findById(id)
    .then( todo => {
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
    .then(() => res.redirect(`/todos/${id}`))
    .catch(error => console.log(error))
})

// step 1. 這裡 id 和 name 兩種資料都來自客戶端，id 要從網址上用 req.params.id 拿下來，而 name 要用 req.body.name 從表單拿出來。
// step 2. Todo.findById(id) 和 todo.save()。接下來的資料操作我們呼叫了以上兩次資料操作方法，這裡要注意，資料操作是由另一台資料庫伺服器幫忙執行的(透過mongoose的語法呼叫mongodb幫忙做事情)！！只要是請別人做的事情，都會有成功/失敗的狀況。重要: 在流程上，我們需要等待資料庫返回執行結果，才能進行下一個動作，所以這裡有兩段的.then()。任一步驟出現失敗，都會跳進錯誤處理。
// Todo.create() v.s. todo.save() : 前者是操作整份資料，後者是針對單一資料。在「新增資料」時兩種作法都可以，而這次因為搭配的資料操作是 Todo.findById，這個方法只會返回一筆資料，所以後面需要接 todo.save() 針對這一筆資料進行儲存，而非操作整份資料。
// 記住是在res.render的時候要使用.lean(), 上述Updete的情況不需要使用(若使用的話, 反而無法執行接下來的todo.save()指令)


// show details of every to-do
app.get('/todos/:id', (req, res) => {
  const id = req.params.id
  return Todo.findById(id)
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
app.post('/todos/:id/delete', (req, res) => {
  const id = req.params.id
  return Todo.findById(id)
    .then(todo => todo.remove())
    .then(() => res.redirect('/'))
    .catch(error => console.log(error) )
})

// step 1. 透過 req.params.id 取得網址上的識別碼，用來查詢使用者想刪除的 To-do。
// step 2. 使用 Todo.findById 查詢資料，資料庫查詢成功以後，會把資料放進 todo。
// step 3. 用 todo.remove() 刪除這筆資料。
// step 4. 成功刪除以後，使用 redirect 重新呼叫首頁，此時會重新發送請求給 GET /，進入到另一條路由。 





// start and listen on the server
app.listen(port, () => {
  console.log(`The server is listening on http://localhost:${port} `)
})


// 重點:
// 將應用程式server連線到database server
// mongoose.connect 是 Mongoose 提供方法，當程式執行到這一行指令時，就會與資料庫連線。在這裡我們需要告知程式要去哪些尋找資料庫，因此需要傳入路徑，語法說明如下：
// mongoose.connect (執行mongoose提供的connect方法，與資料庫連線)
// mongodb:// (Mongoose的通訊規範格式)
// localhost (資料庫伺服器位置)
// todo_list (資料庫名稱)

// 資料庫路徑的完整結構：
// mongoose.connect('mongodb://[資料庫帳號]: [資料庫密碼]@[MongoDB位置]:[port]/[資料庫名稱]')
// 帳號與密碼：我們之前並沒有刻意設定帳號密碼，所以這裡可以省略
// MongoDB 位置：資料庫的位置，通常會是一個 IP 或是網址，之前因為我們的資料庫伺服器啟動，預設位置是 localhost:27017，localhost 指的是自己的電腦，也可以用 IP 127.0.0.1 來表達同一個位置。
// port：本機的預設位置是 27017，這裡可以省略
// 資料庫名稱：剛才我們用 Robo 3T 新增的資料庫名稱

// 連線成功後，我們就可以把這個連線狀態透過 const db = mongoose.connection 儲存到 db 這個物件。以後就可以透過 db 去使用不同連線狀態時的指令，以後我們會常常用到。
// db.on()：在這裡用 on 註冊一個事件監聽器，用來監聽 error 事件有沒有發生，語法的意思是「只要有觸發 error 就印出 error 訊息」。
// db.once() - 針對「連線成功」的 open 情況，我們也註冊了一個事件監聽器，相對於「錯誤」，連線成功只會發生一次，所以這裡特地使用 once，由 once 設定的監聽器是一次性的，一旦連線成功，在執行 callback 以後就會解除監聽器。


// 處理 DeprecationWarning 警告
// 以「current URL string parser is deprecated, and will be removed in a future version.」為例，在 MongoDB 的 3.1.0 版之前，向資料庫連線時不一定要加上 port，但在 3.1.0 版本後，連線資料庫時一定要加上 port。
// 這種改版會有一個過渡期，在過渡期時 MongoDB 透過 DeprecationWarning 向你發出警告，告訴你你現在的作法即將被棄用，請你調整你的程式，以免未來正式棄用時，專案就跑不動了。
// 應對方法: 跟著終端機所回傳的建議, 回到 app.js，找到 mongoose.connect，在連線資料庫的同時傳入設定，可以直接把兩組設定合併成一個物件：mongoose.connect('mongodb://localhost/todo-list', { useNewUrlParser: true, useUnifiedTopology: true })