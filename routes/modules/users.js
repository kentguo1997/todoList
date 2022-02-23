// Include Express and Express Router
const express = require('express')
const router = express.Router()


// setting routes
router.get('/login', (req, res) => {
  res.render('login')
})


// export
module.exports = router