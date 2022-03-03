// Passport 是負責登入的 middleware

// Include Passport & Passport LocalStrategy Module
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const FacebookStrategy = require('passport-facebook').Strategy

// Include bcrypt for encrypting password
const bcrypt = require('bcryptjs')

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
  passport.use(new LocalStrategy( { usernameField: 'email', passReqToCallback: true }, (req, email, password, done) => {
    User.findOne({ email })
      .then(user => {
        if (!user) {
          return done(null, false, req.flash('error', 'User not found!'))
        }
        // bcrypt 本身提供了 bcrypt.compare 方法，用來判斷使用者登入時輸入的密碼，是否與資料庫裡的雜湊值(註冊時經由hash處理的值)一致。
        // bcrypt.compare(password, user.password) 的第一個參數是使用者的輸入值，而第二個參數是資料庫裡的雜湊值，bcrypt 會幫我們做比對，並回傳布林值，在文中我們用 isMatch 來代表。
        return bcrypt.compare(password, user.password).then(isMatch => {
          if (!isMatch) {
            return done(null, false, req.flash('error', 'Email or Password incorrect!'))
          }
          return done(null, user)
        })
      })
      .catch(error => done(error, false))
  }))
  
  // 重點:
  // 1. 把 callback 語法改寫成 Promise 風格，也就是在資料庫操作後加上 .then，並且把錯誤處理移到 .catch 裡
  // 2. 在 new LocalStractegy 的時候，多傳了第一個參數 { usernameField: 'email' }，把驗證項目從預設的 username 改成 email。
  // 3. 為錯誤情況客製了提示訊息，後面會再把這些訊息搬進前端畫面 
  // 4. 比對密碼的部分，官方設定的 user.verifyPassword(password) 只是舉例，假設你曾經在 User model 裡定義一個叫 verifyPassword 的方法，而我們並沒有定義這個方法，這邊暫時寫 user.password !== password，後面和密碼驗證有關的設定都會再優化
  
  
  // 設定登入策略(選擇facebook)
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_ID,
    clientSecret: process.env.FACEBOOK_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK,
    profileFields: ['email', 'displayName']
  }, (accessToken, refreshToken, profile, done) =>  {
    const { name, email } = profile._json
    User.findOne({ email })
      .then(user => {
        if(user)  return done(null, user)
        const randomPassword = Math.random().toString(36).slice(-8)
        bcrypt  
          .genSalt(10)
          .then(salt => bcrypt.hash(randomPassword, salt))
          .then(hash => User.create({
            name,
            email,
            password: hash
          }))
          .then(user => done(null, user))
          .catch(err => done(err, false))
      })      
  }))

  // 重點 : (FacebookStrategy() 的前三個參數是應用程式設定)
  // 1. clientID: FACEBOOK_APP_ID - 請把值改成你的「應用程式編號」
  // 2. clientSecret: FACEBOOK_APP_SECRET - 請把值改成你的「應用程式密鑰」
  // 3. callbackURL: "http://localhost:3000/auth/facebook/callback"`- 在用戶端 OAuth 設定的重新導向 URI，直接保留即可
  // 4. profileFields: 這個設定是和 Facebook 要求開放的資料，我們要了兩種資料：
  // email：這是必要的，需要拿回來當成帳號
  // displayName：Facebook 上的公開名稱，也許能和 User 的 name 屬性對應起來
  // 5. 由於屬性 password 有設定必填，我們還是需要幫使用 Facebook 註冊的使用者製作密碼。因此這裡刻意設定一串亂碼。(randomPassword)
  // Math.random() - 先用產生一個 0-1 的隨機小數，例如 0.3767988078359976
  // .toString(36) - 運用進位轉換將 0.3767988078359976 變成英數參雜的亂碼。這裡選用 36 進位，是因為 36 是 10 個數字 (0, 1, 2, ... 9) 加上 26 個英文字母 (a, b, c, ... , x, y, z) 的總數，在 36 進位裡剛好可以取得所有的英數字母。此時的回傳結果可能是'0dkbxb14fqq4'
  // slice(-8) - 最後，截切字串的最後一段，得到八個字母，例如 'xb14fqq4'




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