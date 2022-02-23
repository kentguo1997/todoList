// Include Express and Express Router
const express = require('express')
const router = express.Router()


// setting routes
router.get('/login', (req, res) => {
  res.render('login')
})

router.post('/login', (req, res) => {
  
})

router.get('/register', (req, res) => {
  res.render('register')
})

// export
module.exports = router