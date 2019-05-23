const fs = require('fs')
const path = require('path')
const readline = require('readline')
const readStream = fs.createReadStream(path.resolve(__dirname, '../db/data.txt'))
const readFile = readline.createInterface(readStream)
const writeStream = fs.createWriteStream(path.resolve(__dirname, './output.txt'))

readFile.on('line', data => {
  const parsedData = JSON.parse(`{${data}}`)
  for (const singleData in parsedData) {
    const { location: { gridNumber } } = parsedData[singleData]
    if (gridNumber % 2 === 1) {
      writeStream.write(`${data}\n`)
    }
  }
})

readFile.on('close', () => {
  writeStream.end()
  console.log('end')
})
