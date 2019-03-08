const express = require('express')
const app = express()
const path = require('path')
const ip = require('ip')
const util = require('./util')
const mustacheExpress = require('mustache-express')
const CollectManager = require('./CollectManager')
const StateManager = require('./StateManager')
const WebSocket = require('ws')
const WebSocketServer = WebSocket.Server
const wss = new WebSocketServer({port: 81})

const DATA_PATH = path.resolve(__dirname, '../db/data.txt')
const WIFI_LIST_PATH = path.resolve(__dirname, '../db/wifi_list.json')
const SELECTED_LIST_PATH = path.resolve(__dirname, '../db/selectedList.json')
const MAP_STATE_PATH = path.resolve(__dirname, '../db/mapState.json')

const mapState = new StateManager(MAP_STATE_PATH)

// websocket
wss.on("connection", function(ws) {
  const msg = {
    type: 'init',
    msg: "Hello! I am a server."
  }
  ws.send(JSON.stringify(msg));
  ws.on("message", function(message) {
    const { type, msg } = JSON.parse(message)
    switch (type) {
      case "init":
        console.log("Received: %s", msg)
        break;
      case "selected":
        mapState.set('selected', msg)
        console.log("Received: selected")
        break;
      case "blocked":
        mapState.set('blocked', msg)
        console.log("Received: blocked")
        break;
      case "map":
        mapState.set('map', msg)
        console.log("Received: map")
        break;
      default:
        console.log(msg)
    }
  });
});

// Broadcast to all.
wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

// CollectManager Init
const collectManager = new CollectManager({
  DATA_PATH, WIFI_LIST_PATH, SELECTED_LIST_PATH
}, wss, mapState)

app.engine('mst', mustacheExpress());

// Static File Path
app.use('/assets', express.static('assets'))
app.use('/', express.static('views'))
app.use(express.json())
app.get('/', (req, res) => {
  console.log(util.getUnixTime(), ': welcome page')
  const list = collectManager.selectedList()
  res.render('index.mst', {
    'hostIp': ip.address(),
    'selectedList': list,
    'block': mapState.get('blocked'),
  })
})

// collect data 
app.post('/collect', (req, res) => collectManager.collect(req, res))

// check data
app.get('/data', (req, res) => collectManager.getData(req, res))

// check wifi list
app.get('/list', (req, res) => collectManager.getList(req, res))

// delete data
app.delete('/data', (req, res) => collectManager.deleteData(req, res))

// getSelectedList
app.get('/selectedlist', (req, res) => collectManager.selectedList(req, res))

// get learning Data
app.get('/learningData', (req, res) => collectManager.getLearningData(req, res))

// pass to python server
app.post('/upload', (req, res) => collectManager.sendPosition(req, res))

// search
app.post('/search', (req, res) => collectManager.search(req, res))

// test
app.get('/test', (req, res) => collectManager.test(req, res))

app.listen(80, () => {
  console.log(`Meeting Room Server listening on port ${ip.address()}:80`)
})
