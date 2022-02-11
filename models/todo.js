// Include mongoose 
const mongoose = require('mongoose')

// define the data of todo's structure (define model)
const Schema = mongoose.Schema
const todoSchema = new Schema({
  name: {
    type: String,  // data type is string
    required: true // required part
  }
})

// export this Schema for other files' use
module.exports = mongoose.model('Todo', todoSchema)

// mongoose.model, 用剛剛定義的 schema 產生 model 。第一個參數是 string ，這個 string 會轉成複數形，成為 MongoDB 的 documents 名子，mongoose.model 產生的物件具有.find 、 .create 等等的方法，用以操作資料庫。
// mongoose 的文件中有提到會自動將上面命名的'Todo'轉換成小寫複數型態(遇到不認識的字的話，會直接加上 s)變成Robo 3T中可以看到的todos的documents(該documents存放於collections中)




// 重點:
// 在 MVC 的專案架構中，負責和資料庫互動的元件是 model，現在我們也要為我們的專案來擴充 model 的架構。
// step 1. 在專案目錄新增一個 models 資料夾，注意用了複數名詞
// step 2. 然後新增 todo.js 檔案，這個檔案會代表 Todo model，以後每一種資料都會有一個獨立文件來管理
// step 3. 先把 mongoose 載入進來，才能使用相關方法。
// step 4. 使用Mongoose 提供的 mongoose.Schema 模組，設定Schema(資料庫綱要), 確保每一筆 todo 資料都會長得是這個樣子。
// step 5. 這裡最重要的步驟是把我們想要的資料結構當成參數傳給 new Schema()，以下是我們的設定：
// 1. 每筆 todo 資料都有一個叫做 name 的屬性
// 2. 我們規定 name 屬性：type: String - 必須是字串型別, required: true - 是必填欄位，不能為空白
// step 6. 然後透過 module.exports 把這個 schema 輸出。(匯出的時候我們把這份 schema 命名為 Todo，以後在其他的檔案直接使用 Todo 就可以操作和「待辦事項」有關的資料了！):
// module.exports = mongoose.model('Todo', todoSchema /// module.exports 是 Node.js 模組匯出的界面，
// 在 Node.js 中每個.js 都是一個模組，特別注意 model 與 modules 是兩個不同的字，模組與模組之間不能直接使用對方的 variable 、 function ，必須藉由 require 與 module.exports 互相溝通，在此即為把剛剛創造的 model 匯出。
