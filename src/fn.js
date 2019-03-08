module.exports = {
  convertWifiIndex (wifiInfoJSON) {
    const timestampArr = Object.keys(wifiInfoJSON);
    const wifi = new Set();
    timestampArr.forEach((timestamp) => {
      wifi.add(wifiInfoJSON[timestamp].location.gridNumber);
    });

    const wifiList = [...wifi];
    wifiList.sort((a, b) => a - b);
    return wifiList;
  },
  nomalization ({location, wifiInfo}, wifiListArr, wifiIndexArr, EXCLUDED_LEVEL) {
    const question = Array.from({length: wifiListArr.length}, () => EXCLUDED_LEVEL);
    const answer = Array.from({length: wifiIndexArr.length}, () => 0);

    // find answer
    answer[wifiIndexArr.indexOf(location.gridNumber)] = 1;

    // fill question
    wifiInfo.forEach(({BSSID, level}) => {
      const wifiIndex = wifiListArr.indexOf(BSSID);
      question[wifiIndex] = level;
    });

    return {question, answer};
  },
  extract(wifiInfoJSON, wifiListJSON, EXCLUDED_LEVEL=150) {
    const wifiListArr = Object.keys(wifiListJSON);
    const timestampArr = Object.keys(wifiInfoJSON);
    const wifiIndexArr = this.convertWifiIndex(wifiInfoJSON);
    return timestampArr.reduce((acc, timestamp) => {
      const {question, answer} = this.nomalization(wifiInfoJSON[timestamp], wifiListArr, wifiIndexArr, EXCLUDED_LEVEL);
      acc.question.push(question);
      acc.answer.push(answer);
      return acc;
    }, {
      question: [],
      answer: [],
    });
  }
};
