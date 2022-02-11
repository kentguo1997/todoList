// Include mongoose 
const mongoose = require('mongoose')

// define the data of todo's structure
const Schema = mongoose.Schema
const todoSchema = new Schema({
  name: {
    type: String,  // data type is string
    required: true // required part
  }
})

// export this Schema for other files' use
module.exports = mongoose.model('Todo', todoSchema)





// 重點:
// 在 MVC 的專案架構中，負責和資料庫互動的元件是 model，現在我們也要為我們的專案來擴充 model 的架構。
// step 1. 在專案目錄新增一個 models 資料夾，注意用了複數名詞
// step 2. 然後新增 todo.js 檔案，這個檔案會代表 Todo model，以後每一種資料都會有一個獨立文件來管理
// step 3. 先把 mongoose 載入進來，才能使用相關方法。
// step 4. 使用Mongoose 提供的 mongoose.Schema 模組，設定Schema(資料庫綱要), 確保每一筆 todo 資料都會長得是這個樣子。
// step 5. 這裡最重要的步驟是把我們想要的資料結構當成參數傳給 new Schema()，以下是我們的設定：
// 1. 每筆 todo 資料都有一個叫做 name 的屬性
// 2. 我們規定 name 屬性：type: String - 必須是字串型別, required: true - 是必填欄位，不能為空白
// step 6. 然後透過 module.exports 把這個 schema 輸出。(匯出的時候我們把這份 schema 命名為 Todo，以後在其他的檔案直接使用 Todo 就可以操作和「待辦事項」有關的資料了！)
