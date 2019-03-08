const express = require('express')
const app = express()
const fs = require('fs')
const path = require('path')
const ip = require('ip')

app.use(express.static('assets'))
app.use(express.json())

app.use('/result.json', express.static(path.resolve(__dirname, './result.json')))
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'index.html'))
  // res.send(`Meeting Room Server listening on port ${ip.address()}:80`)
})

app.listen(3000, () => {
  console.log(`Meeting Room Server listening on port ${ip.address()}:80`)
})
