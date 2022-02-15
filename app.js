// app.js 就是扮演controller的角色 (Controller 是統一中控台，從程式外部發進來的請求一律交給 controller，由 controller 來進行內部聯繫，也就是負責串連 model 和 view。)
// Include packages in the file
const express = require('express')
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')

require('./config/mongoose') // 對 app.js 而言，Mongoose 連線設定只需要「被執行」，不需要接到任何回傳參數繼續利用，所以這裡不需要再設定變數。
const routes = require('./routes')    // Include routes (index.js) (引入路由器時，路徑設定為 /routes 就會自動去尋找目錄下叫做 index 的檔案。)
const port = 3000

const app = express() // 全部載入後, 執行app這個伺服器

 
// setting template engine
// 建立一個名為hbs的樣板引擎, 並傳入exphbs與相關參數
// 呼叫 exphbs 的時候，除了設定預設樣板，還多了一組設定 extname: '.hbs'，是指定副檔名為 .hbs，有了這行以後，我們才能把預設的長檔名改寫成短檔名。
app.engine('hbs', exphbs({ defaultLayout: 'main', extname: '.hbs'}))
// 開始啟用樣板引擎hbs
app.set('view engine', 'hbs')



// app.use設定
// setting body-parser for showing properties of req.body
app.use(bodyParser.urlencoded({ extended: true }))
// setting methodOverride for using PUT & DELETE Method
app.use(methodOverride('_method'))
// setting routes for all requests
app.use(routes)

// 重點: 記得bodyParser跟method-override要放在routes之前, 讓它能夠對所有的request進行前置處理(在request跟response之間扮演middleware的角色)，處理好了以後，才讓 request 繼續往下進入特定路由。


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