const util = require('./util')
const fs = require('fs')
const fn = require('./fn')
const mazeSearch = require('./mazeSearch')
const axios = require('axios') 

class CollectManager {
  constructor({ DATA_PATH, WIFI_LIST_PATH, SELECTED_LIST_PATH }, WebSocketServer, STATE) {
    this.DATA_PATH = DATA_PATH
    this.WIFI_LIST_PATH = WIFI_LIST_PATH
    this.SELECTED_LIST_PATH = SELECTED_LIST_PATH
    this.wss = WebSocketServer
    this.state = STATE.data

    // object
    this.collectedList = JSON.parse(fs.readFileSync(this.SELECTED_LIST_PATH, 'utf8'))

    // read data file
    util.writeEmptyFile(this.DATA_PATH, 'string')
    util.writeEmptyFile(this.WIFI_LIST_PATH, 'json')
  }

  test(req, res) {
    res.end('test')
  }

  _setCollectedList (gridNumber) {
    const parsedStr = String(gridNumber)

    if(!this.collectedList.hasOwnProperty(parsedStr)) {
      this.collectedList[parsedStr] = 1
    } else {
      this.collectedList[parsedStr]++
    }

    this.wss.broadcast(JSON.stringify({
      type: "collect",
      msg: this.collectedList
    }));
    fs.writeFileSync(this.SELECTED_LIST_PATH, JSON.stringify(this.collectedList))
  }

  resetCollectedList () {
    this.collectedList = {};
  }

  collect(req, res) {
    // console.log(req.body)
    // res.end()
    // return

    const resData = req.body
    let parsedData;

    if (util.isJSON(resData)) {
      parsedData = JSON.parse(resData)
    } else {
      parsedData = resData
    }

    const { location: { gridNumber }, wifiInfo } = parsedData
    // send location
    console.log('broadCast: ', gridNumber)
    this._setCollectedList(gridNumber)

    // wifi list check
    if (!wifiInfo) {
      console.log('There is no wifiInfo Property')
      res.end()
      return
    }

    const cacheList = {}
    wifiInfo.forEach(wifi => {
      const BSSID = wifi['BSSID']
      cacheList[BSSID] = true
    })
    util.readAndWriteJSON(this.WIFI_LIST_PATH, cacheList)

    const curTime = util.getUnixTime()
    const inputData = `"${curTime}": ${JSON.stringify(parsedData)}\n`
    console.log(curTime, ': write data ')

    fs.appendFile(this.DATA_PATH, inputData, (err) => {
      res.end()
    })
  }

  getData(req, res) {
    // 도중 삭제될 경우 예외 처리
    util.writeEmptyFile(this.DATA_PATH)
    const readTxt = fs.readFileSync(this.DATA_PATH, 'utf8')
    util.txtToJSONString(readTxt, false, (jsonString) => {
      console.log(`${util.getUnixTime()}: get data`)
      if (!jsonString) {
        res.send('THERE IS NO DATA')
      } else {
        res.setHeader('Content-disposition', 'attachment; filename= wifi_info.json');
        res.setHeader('Content-type', 'application/json');
        res.write(jsonString, function (err) {
            res.end();
        })
      }
    })
  }

  _getData(cb) {
    util.writeEmptyFile(this.DATA_PATH)
    const readTxt = fs.readFileSync(this.DATA_PATH, 'utf8')
    util.txtToJSONString(readTxt, false, (jsonString) => {
      cb(jsonString)
    })
  }

  getList(req, res) {
    const isExisted = fs.existsSync(this.WIFI_LIST_PATH)
    if (isExisted) {
      const cachedData = JSON.parse(fs.readFileSync(this.WIFI_LIST_PATH, 'utf8'))
      if (cachedData && !util.isEmptyObject(cachedData)) {
        const keyList = Object.keys(cachedData)
        const jsonString = JSON.stringify(keyList)

        res.setHeader('Content-disposition', 'attachment; filename= wifi_list.json');
        res.setHeader('Content-type', 'application/json');
        res.write(jsonString, function (err) {
            res.end();
        })
        return
      }
    }

    res.send('THERE IS NO WIFI LIST')
  }

  _getListObject() {
    const isExisted = fs.existsSync(this.WIFI_LIST_PATH)
    if (isExisted) {
      return JSON.parse(fs.readFileSync(this.WIFI_LIST_PATH, 'utf8'))
    }
  }

  deleteData(req, res) {
    console.log(`${util.getUnixTime()}: delete data`)
    util.writeEmptyFile(this.DATA_PATH, 'string', true)
    util.writeEmptyFile(this.WIFI_LIST_PATH, 'json', true)
    res.end()
  }

  selectedList (req, res) {
    const selectedList = fs.readFileSync(this.SELECTED_LIST_PATH, 'utf8')
    if(req) {
      res.send(selectedList)
    } else {
      return selectedList
    }
  }

  setPosition (gridNumber) {
    console.log('here: ', gridNumber)
    this.wss.broadcast(JSON.stringify({
      type: "position", 
      msg: gridNumber,
    }));
  }

  getLearningData (req, res) {
    const { excludedLevel: EXCLUDED_LEVEL } = req.query
    this._getData((jsonString) => {
      const wifiInfo = JSON.parse(jsonString)
      const wifiList = this._getListObject()
      const result = fn.extract(wifiInfo, wifiList, EXCLUDED_LEVEL)

      res.setHeader('Content-disposition', `attachment; filename= result_${EXCLUDED_LEVEL}.json`);
        res.setHeader('Content-type', 'application/json');
        res.write(JSON.stringify(result), function (err) {
            res.end();
        })
    })
  }

  async sendPosition (req, res) {
    const { data: gridNumber } = await axios.post(`http://localhost:8800/upload`, {
      ...req.body
    })

    // gridNumber 전달 하면 됨
    const originGrid = this.state.selected[gridNumber]
    this.setPosition(originGrid)
    res.send(String(originGrid))
  }

  async search (req, res) {
    const { target, location } = req.body
    const maze = await this._executedMazeSearch(location, target)

    this.wss.broadcast(JSON.stringify({
      type: "path",
      msg: maze,
    }))

    console.log('maze: ', maze.length)
    res.send(JSON.stringify(maze))
  }

  async _executedMazeSearch(originGrid, target) {
    const { map } = this.state.map
    const copyMap = map.slice()
    const parsedMap = this._getParsedMap(copyMap)
    const targetPos = this._getParsedPosition(target)
    const originPos = this._getParsedPosition(originGrid)

    const path = await mazeSearch(parsedMap, originPos, targetPos)
    return this._getOriginPositionPath(path)
  }

  _getOriginPositionPath (path){
    const { column } = this.state.map
    return path.map(([y, x]) => column * y + x)
  }

  _getParsedMap(map) {
    const { column, row } = this.state.map
    
    const parsedMap = [];
    for (let i = 0; i < row; i++) {
      parsedMap.push(map.splice(0, column));
    }

    return parsedMap
  }

  _getParsedPosition(pos) {
    const { column } = this.state.map
    const y = Math.floor(pos / column)
    const x = pos % column
    return [y, x]
  }
}

module.exports = CollectManager
