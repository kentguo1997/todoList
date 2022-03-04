// the routes related to fb login setting

// Include Express and Express Router
const express = require('express')
const passport = require('passport')
const router = express.Router()

// setting routes

// button for sending request
router.get('/facebook', passport.authenticate('facebook', {
  scope: ['email', 'public_profile']
}))

//  facebook callback
router.get('/facebook/callback', passport.authenticate('facebook', {
  successRedirect: '/',
  failureRedirect: '/users/login'
}))

// Export module
module.exports = router

// 重點:
// 1. 其中 GET /auth/facebook 是向 Facebook 發出請求，帶入的參數 scope: ['email', 'public_profile'] 是我們向 Facebook 要求的資料。
// 2. 而 GET / auth / facebook / callback 是 Facebook 把資料發回來的地方，這條路由其實和 POST / users / login 差不多，如果能用傳回來的資料順利登入，就放 request 進場，如果登入失敗，就再導向登入頁。
