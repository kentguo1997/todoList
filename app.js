// Include packages in the file
const express = require('express')
const app = express()
const exphbs = require('express-handlebars')
const mongoose = require('mongoose')
const Todo = require('./models/todo') // Include Todo model
const port = 3000

// setting template engine
// 建立一個名為hbs的樣板引擎, 並傳入exphbs與相關參數
// 呼叫 exphbs 的時候，除了設定預設樣板，還多了一組設定 extname: '.hbs'，是指定副檔名為 .hbs，有了這行以後，我們才能把預設的長檔名改寫成短檔名。
app.engine('hbs', exphbs({ defaultLayout: 'main', extname: '.hbs'}))
// 開始啟用樣板引擎hbs
app.set('view engine', 'hbs')

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
// browse all todos at index
app.get('/', (req, res) => {
  Todo.find()
    .lean()
    .then(todos => res.render('index', { todos }))
    .catch(error => console.error(error))
})

// 每個用 . 串接的方法都是按順序進行，一個步驟完成以後才會進入下一步，除非遇到錯誤才會跳到 .catch。
// Todo.find() : 取出 Todo model 裡的所有資料，現在沒有傳入任何參數，所以會撈出整份資料。
// .lean() : 把 Mongoose 的 Model 物件轉換成乾淨的 JavaScript 資料陣列，這裡可以記一個口訣：「撈資料以後想用 res.render()，要先用 .lean() 來處理」。
// .then() : 到了 .then() 這一步資料(已被lean轉換後的js乾淨資料陣列)會被放進 todos 變數，你就可以用 res.render('index', { todos }) 把資料傳給 index 樣板。這裡 { todos } 是 { todos: todos } 的縮寫。
// .catch(): 錯誤處理，如果有錯誤的話先把錯誤內容印出來。
// 補充: 這種有 .then().catch() 出現的實作方法叫做 Promise，是 ES6 之後因應 JavaScript 的非同步特性 (不按順序發生) 而發展出的改良寫法，在這種寫法裡你可以從文件上直接看出明顯的先後順序。(在這個作法出現前，我們通常用 callback 來控制先後順序，就像我們在做 DOM 的事件處理時，一個函式做完以後，再把另一個 callback 函式當成參數傳進來，表示下一個動作。相比起來，以前的 callback 作法就要花點精力才能看出程式碼的執行順序，所以在 ES6 做了改良。)




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