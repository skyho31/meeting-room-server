const wifiListJSON = require('./wifi_list');
const wifiInfoJSON = require('./wifi_info');
const fs = require('fs');
const fn = require('./fn');

const result = fn.extract(wifiInfoJSON, wifiListJSON);

fs.writeFile('result.json', JSON.stringify(result), 'utf8', () => console.log('End'));