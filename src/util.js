const fs = require('fs')

function getUnixTime () {
  return Math.floor(new Date().getTime() / 1000)
}

function isJSON (str) {
  try {
    JSON.parse(str)
  } catch (e) {
    return false;
  }
  return true;
}

function isEmptyObject (obj) {
  for(const key in obj) {
      if(obj.hasOwnProperty(key))
          return false;
  }
  return true;
}

function txtToJSONString(txt, save=false, cb) {
  if(!txt) {
    cb('')
  }

  const arr = txt.split('\n')
  const returnObj = {}
  arr.forEach((str) => {
    const obj = JSON.parse(`{${str}}`)
    for (const timestamp in obj) {
      const { location, wifiInfo } = obj[timestamp]
      parsedWifiInfo = []
      for (const item of wifiInfo) {
        const { BSSID, level } = item
        parsedWifiInfo.push({
          BSSID, level
        })
      }
      returnObj[guid()] = {
          location,
          wifiInfo: parsedWifiInfo
      }
    }
  })

  if (save) {
    fs.writeFileSync('result.json', JSON.stringify(returnObj), 'utf8')
  } else {
    cb(JSON.stringify(returnObj));
  }
}

function writeEmptyFile (DATA_PATH, type="STRING", isForce = false) {
  if (!DATA_PATH) {
    throw new Error('파일의 경로가 필요합니다.')
  }
  if(isForce) {
    fs.writeFileSync(DATA_PATH, '')
  } else {
    const isExistedFile = fs.existsSync(DATA_PATH)
    if (!isExistedFile) {
      let data = ''
      switch (type.toUpperCase()) {
        case 'STRING':
          data = ''
          break
        case 'JSON':
          data = JSON.stringify({})
      }
      fs.writeFileSync(DATA_PATH, data)
    }
  }
}

function readAndWriteJSON (DATA_PATH, data) {
  const isExisted = fs.existsSync(DATA_PATH)
  let mergedData = data
  if(isExisted) {
    const cachedData = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'))
    mergedData = Object.assign({}, cachedData, data)
  }

  fs.writeFileSync(DATA_PATH, JSON.stringify(mergedData))
}

/**
 * Generates a GUID string.
 * @returns {String} The generated GUID.
 * @example af8a8416-6e18-a307-bd9c-f2c947bbb3aa
 * @author Slavik Meltser (slavik@meltser.info).
 * @link http://slavik.meltser.info/?p=142
 */
function guid() {
    function _p8(s) {
        var p = (Math.random().toString(16)+"000000000").substr(2,8);
        return s ? "-" + p.substr(0,4) + "-" + p.substr(4,4) : p ;
    }
    return _p8() + _p8(true) + _p8(true) + _p8();
}

module.exports = {
  getUnixTime,
  isJSON,
  txtToJSONString,
  writeEmptyFile,
  readAndWriteJSON,
  isEmptyObject
}
