// Include Express and Express Router
const express = require('express')
const router = express.Router()

// Include Passport
const passport = require('passport')

// Include bcrypt for encrypting password
const bcrypt = require('bcryptjs')

// Include userModel
const User = require('../../models/user')

// setting routes
router.get('/login', (req, res) => {
  res.render('login')
})

// 使用middleware passport提供的 authenticate 方法執行驗證request的登入狀態
router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureFlash: true,
  failureRedirect: '/users/login'
}))

// 重點:
// 比起使用function, 使用用 successRedirect 來定義成功登入時呼叫的樣板，讓程式的語義更明顯

router.get('/register', (req, res) => {
  res.render('register')
})

router.post('/register', (req, res) => {
  // get parameters from req.body
  const { name, email, password, confirmPassword } = req.body

  // get flash error message
  const errors = []

  // determine if the error situation exists
  if (!name || !email || !password || !confirmPassword) {
    errors.push({ message: 'Please fill out the form!' })
  }

  if (password !== confirmPassword) {
    errors.push({ message: 'Password and Confirm Password do not match!' })
  }

  if (errors.length) {
    return res.render('register', {
      errors,
      name,
      email,
      password,
      confirmPassword
    })
  }

  // determine if the user has already registered
  User.findOne({ email })
    .then(user => {
      // already exists
      if (user) {
        errors.push({ message: 'User Already exists!' })
        return res.render('register', {
          // show the contents user just input for check
          errors,
          name,
          email,
          password,
          confirmPassword
        })
      }
      return bcrypt
        .genSalt(10) // 產生「鹽」，並設定複雜度係數為 10
        .then(salt => bcrypt.hash(password, salt)) // 為使用者密碼「加鹽」，產生雜湊值
        .then(hash => User.create({
          name,
          email,
          password: hash // 用雜湊值取代原本的使用者密碼
        }))
        .then(() => res.redirect('/'))
        .catch(error => console.log(error))
    })
})

router.get('/logout', (req, res) => {
  req.logout() // req.logout() 是 Passport.js 提供的函式，會幫你清除 session
  req.flash('success_msg', 'Logged Out Successfully!')
  res.redirect('/users/login') // 登出之後，我們就把使用者帶回登入頁面。
})

// export
module.exports = router
