// Include Express and Express Router
const express = require('express')
const router = express.Router()

// Include Passport
const passport = require('passport')

// Include userModel
const User = require('../../models/user')


// setting routes
router.get('/login', (req, res) => {
  res.render('login')
})


// 使用middleware passport提供的 authenticate 方法執行驗證request的登入狀態
router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/users/login'
}))

// 重點: 
//比起使用function, 使用用 successRedirect 來定義成功登入時呼叫的樣板，讓程式的語義更明顯



router.get('/register', (req, res) => {
  res.render('register')
})

router.post('/register', (req, res) => {
  // get parameters from req.body
  const { name, email, password, confirmPassword } = req.body
  
  // determine if the user has already registered 
  User.findOne({email})
    .then ( user => {
      
      // already exists
      if (user) {
        console.log('User already exists!')
        res.render('register', {
          // show the contents user just input for check 
          name,
          email,
          password,
          confirmPassword
        })
      } else {
        // new user
        const newUser = new User({
          name,
          email,
          password
        })

        newUser.save()
        .then(() => res.redirect('/'))
        .catch (error => console.log(error))
      }
    })
})

// export
module.exports = router