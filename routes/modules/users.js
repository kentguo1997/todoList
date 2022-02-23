// Include Express and Express Router
const express = require('express')
const router = express.Router()

// Include userModel
const User = require('../../models/user')

// setting routes
router.get('/login', (req, res) => {
  res.render('login')
})

router.post('/login', (req, res) => {
  
})

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