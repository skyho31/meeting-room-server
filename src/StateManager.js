const fs = require('fs')

module.exports = class {
  constructor (path) {
    this.path = path
    this.data = this._readData()
  }

  _readData (path) {
    return JSON.parse(fs.readFileSync(this.path))
  }

  _writeData () {
    fs.writeFileSync(this.path, JSON.stringify(this.data))
  }

  get (key) {
    return this.data[key]
  }

  set (key, value) {
    this.data[key] = value
    this._writeData()
  }
}
