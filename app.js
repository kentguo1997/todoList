// Include packages in the file
const express = require('express')
const app = express()
const port = 3000


// setting routes
app.get('/', (req, res) => {
  res.send('Helo')
})


// start and listen on the server
app.listen(port, () => {
  console.log(`The server is listening on http://localhost:${port} `)
})