// Include Passport & Passport LocalStrategy Module
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

// Include User Model
const User = require('../models/user')

// 建立 Passport這個 middleware(在 Express 開發框架中，middleware 會扮演資料庫與應用程式之間的溝通橋樑，透過不同類別的 middleware 讓資料傳遞更加便利，也依照需求對資料做不同的處理。), 用一個參數 app 把 passport 套件傳進來，完成 passport 的設定。
// Initialize and set passport package to export as a function

module.exports = app => {
  // 初始化 Passport 模組
  // (這些 app.use 等初始化動作，以前都習慣寫在 app.js 裡，這裡由於建立了專門的 passport 設定檔，我們就拉到設定檔裡來統一管理。)
  app.use(passport.initialize())
  app.use(passport.session()) 
  
  // 設定登入策略(選擇本地)
  passport.use(new LocalStrategy( { usernameField: 'email' }, (email, password, done) => {
    User.findOne({ email })
      .then(user => {
        if (!user) {
          return done(null, false, { message: 'That email is not registered!' })
        }
        if (user.password !== password) {
          return done(null, false, { message: 'Email or Password incorrect' } )
        }
        return done(null, user)
      })
      .catch(error => done(err, false))
  }))
  
  // 重點:
  // 1. 把 callback 語法改寫成 Promise 風格，也就是在資料庫操作後加上 .then，並且把錯誤處理移到 .catch 裡
  // 2. 在 new LocalStractegy 的時候，多傳了第一個參數 { usernameField: 'email' }，把驗證項目從預設的 username 改成 email。
  // 3. 為錯誤情況客製了提示訊息，後面會再把這些訊息搬進前端畫面 
  // 4. 比對密碼的部分，官方設定的 user.verifyPassword(password) 只是舉例，假設你曾經在 User model 裡定義一個叫 verifyPassword 的方法，而我們並沒有定義這個方法，這邊暫時寫 user.password !== password，後面和密碼驗證有關的設定都會再優化


  // 設定序列化與反序列化
  // serialize (從資料庫中找到完整user物件, 把 user id 存入 session)
  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  // deserialize (根據session裡的user id, 從資料庫中查找對應的完整user物件)
  passport.deserializeUser((id, done) => {
    User.findById(id)
      .lean()
      .then(user => done(null, user))
      .catch(err => done(err, null))
  })

  // deserialize的重點:
  // 1. 由於有資料庫操作，依照 Promise 風格用 .then().catch() 來控制流程
  //    查詢 DB → 程式運作正常 → 回傳查找的結果 user → done(null, user)
  //    查詢 DB → 程式運作錯誤 → 回傳錯誤 → done(err, null)
  // 2. 錯誤處理的地方，其實 Passport 看到第一個參數有 err 就不會處理後面的參數了，但我們放一個 null 在語義上明確表達 user 是空的
  // 3. 從資料庫拿出來的物件，很可能會傳進前端樣板，因此遵從 Handlebars 的規格，先用 .lean() 把資料庫物件轉換成 JavaScript 原生物件。
  // 4. 透過serialize/deserialize，我們可以節省 session 的空間。


}