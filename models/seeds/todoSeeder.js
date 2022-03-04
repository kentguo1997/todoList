// Include Packages
const bcrypt = require('bcryptjs')

// 由於我們把 MongoDB 連線搬進了 .env 裡，
// 需要在一開始載入 .env 的檔案, 來供config/mongoose.js來使用
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const Todo = require('../todo')
const User = require('../user')

const db = require('../../config/mongoose')

// define a seed_user
const SEED_USER = {
  name: 'root',
  email: 'root@example.com',
  password: '12345678'
}

// once database connected
db.once('open', () => {
  // Create SEED_USER first
  bcrypt
    .genSalt(10)
    .then(salt => bcrypt.hash(SEED_USER.password, salt))
    .then(hash => User.create({
      name: SEED_USER.name,
      email: SEED_USER.email,
      password: hash
    }))
    .then(user => {
      const userId = user._id
      // Use Promise.all to create data (corresponding to SEED_USER)
      return Promise.all(Array.from(
        { length: 10 },
        (_, i) => Todo.create({ name: `name-${i}`, userId })
      ))
    })
    .then(() => {
      console.log('done.')
      process.exit()
      // process.exit() 指「關閉這段 Node 執行程序」，由於這段 seeder 程式只有在第一次初始化時才會用到，不像專案主程式一旦開始就執行運作，所以在 seeder 做好以後要把這個臨時的 Node.js 程序結束掉。類似把這個臨時的 Node.js 執行環境「關機」的概念。
    })
})

// 在 models 資料夾新增一個命名為 seeds 的資料夾，這個資料夾專門用來管理種子資料腳本，現在只有一個腳本，讓我們命名為 todoSeeder.js，顧名思義，這份檔案裡會放置和「待辦事項」有關的種子資料，而 seeder 就是「種子資料產生器」的意思。
// step 1. 設定資料庫連線 (把 app.js 裡和「資料庫連線」有關的程式碼都複製過來一份，另外，也要一併載入 Todo model，因為這裡要操作的資料和 Todo 有關。)
// step 2. 新增 10 筆資料 (「新增資料」的腳本是「成功連線資料庫」之後執行的動作，因此讓我們把它寫在 db.once() 的 callback 函式裡。):
// Todo.create() 是 Mongoose 提供的資料操作方法，之前我們建立了一個叫 Todo 的 model 物件，而每一個 model 物件都具有一系列的資料操作方法。在這裡我們使用的是 create 方法 (參數是一包物件 {name:'name-'+i}, 使用 Todo.create() 產生資料時，你需要告訴 Todo model 資料內容是什麼，這邊按照了之前在 Todo 的 schema 裡定義的規格。)
