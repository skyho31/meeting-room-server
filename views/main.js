// global variable
const container = document.getElementById("container");
const LENGTH = 1584
const COLUMN_LENGTH = 72
const ROW_LENGTH = 22


const pointList = []
const blockedList = window.__BLOCK__


// map function
const createMap = () => {
  for (let i = 0; i < LENGTH; i++) {
    const box = document.createElement("div");
    const childBox = document.createElement("div")
    childBox.classList.add('child')
  
    if (pointList.includes(i)) {
      console.log(true);
      box.className = "selected box";
    } else if(blockedList.includes(i)) {
      box.className = "disabled box";
    } else {
      box.className = "box";
    }
    box.dataset.number = i;
    box.textContent = i;
    box.appendChild(childBox);
    container.appendChild(box);
  }
}
const toggleBox = (startPos, endPos) => {
  let start;
  let end;
  const targetList = [];
  if (startPos > endPos) {
    start = endPos;
    end = startPos;
  } else {
    start = startPos;
    end = endPos;
  }

  const diff = end - start;
  const startRow = Math.floor(start / COLUMN_LENGTH);
  const endRow = Math.floor(end / COLUMN_LENGTH);

  // case 1 세로 직선
  if (diff % COLUMN_LENGTH === 0) {
    const rowNum = Math.floor(diff / COLUMN_LENGTH);
    for (let i = 0; i <= rowNum; i++) {
      targetList.push(start + i * COLUMN_LENGTH);
    }
  }
  // case 2 가로 직선
  else if (startRow === endRow) {
    for (let i = 0; i <= diff; i++) {
      targetList.push(start + i);
    }
  }
  // case 3 대각선
  else {
    const absStart = start % COLUMN_LENGTH;
    const absEnd = end % COLUMN_LENGTH;

    if (absStart > absEnd) {
      const absDiff = absStart - absEnd;
      start = start - absDiff;
      end = end + absDiff;
    }

    const rowDiff = endRow - startRow;
    const lineDiff = end - (start + rowDiff * COLUMN_LENGTH);
    for (let i = 0; i <= rowDiff; i++) {
      for (let j = 0; j <= lineDiff; j++) {
        targetList.push(start + i * COLUMN_LENGTH + j);
      }
    }
  }

  console.log(targetList)
  renderPartial(targetList, 1);
}
const renderPartial = (data, type=0) => {
  const typeList = ['selected', 'disabled', 'path']
  const className = typeList[type]

  // object
  let pointList;
  if(isJSON(data)) {
    pointList = JSON.parse(data)
  } else {
    pointList = data
  }

  if (type === 2) {
    const refreshList = [...document.getElementsByClassName('path')]
    refreshList.forEach(el => {
      el.classList.remove('path')
    })
  }

  if (type === 3) {
    movePosition(pointList)
    return
  }

  if(Array.isArray(pointList)) {
    pointList.forEach(index => {
      const target = document.querySelector(`[data-number='${index}']`)
      if (!target.classList.contains(className)) {
        target.classList.add(className)
      } else if (type === 1) {
        target.classList.remove(className)
      }
    })
  } else if (typeof(pointList) === 'object') {
    for (const pos in pointList) {
      const target = document.querySelector(`[data-number='${pos}']`)
      const child = target.querySelector('.child')
      
      if (!target.classList.contains(className) || type === 0) {
        target.classList.add(className)
        child.textContent = pointList[pos]
      } else if (type === 1) {
        target.classList.remove(className)
      }
    }
  }
}
const createWebSocket = () => {
  // 웹소켓 전역 객체 생성
  const ws = new WebSocket(`ws://${window.__HOSTIP__}:81`);

  // 연결이 수립되면 서버에 메시지를 전송한다
  ws.onopen = function(event) {
    ws.send(JSON.stringify({
      type:"init",
      msg: "Client message: Hi!"
    }));
  }

  // 서버로 부터 메시지를 수신한다
  ws.onmessage = function(event) {
    const {type, msg} = JSON.parse(event.data)
    switch (type) {
      case "init":
        console.log("Server message: ", msg)
        break
      case "position":
        renderPartial(msg, 3)
        break
      case "path":
        renderPartial(msg, 2)
        break
      default:
        renderPartial(msg)
    }
  }

  // error event handler
  ws.onerror = function(event) {
    console.log("Server error message: ", event.data);
  }

  return ws
}
const bindToggleBoxEvent = () => {
  // click event
  let container_state = -1
  container.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const targetIndex = Number(e.target.dataset.number);
    if (container_state > -1) {
      toggleBox(container_state, targetIndex)
      container_state = -1;
    } else {
      container_state = targetIndex;
    }
  })
}
const getMap = () => {
  const boxs = document.getElementsByClassName('box');
  const parsedMap = [...boxs].map(element => {
    if (element.classList.contains('disabled')) {
      return 1;
    } else {
      return 0;
    }
  })

  return parsedMap;
}
const movePosition = gridNumber => {
  const pos = document.querySelectorAll('.here')
  pos.forEach(el => el.classList.remove('here'))

  const target = document.querySelector(`.selected[data-number='${gridNumber}']`)
  target.classList.add('here')
}

// create button
const createMapButton = (ws) => {
  const mapButton = document.createElement('button')
  mapButton.textContent = 'Get Map'
  mapButton.addEventListener('click', () => {
    const mapData = getMap()
    copyToClipboard(mapData)
    alert('send & copy completed')
    ws.send(JSON.stringify({
      type: 'map',
      msg: {
        map: mapData,
        column: COLUMN_LENGTH,
        row: ROW_LENGTH
      }
    }))
  })
  document.body.appendChild(mapButton)
}
const createSelectedButton = (ws) => {
  const selectedListButton = document.createElement('button')
  selectedListButton.textContent = 'Get Selected'
  selectedListButton.addEventListener('click', () => {
    const selectedList = document.querySelectorAll('.selected')
    const selectedListIdx = [...selectedList].map((node, idx) => node.dataset.number)
    copyToClipboard(selectedListIdx)
    ws.send(JSON.stringify({
      type: 'selected',
      msg: selectedListIdx
    }))
    alert('send & copy completed')
  })
  document.body.appendChild(selectedListButton)
}
const createBlockedButton = (ws) => {
  const blockButton = document.createElement('button')
  blockButton.textContent = 'Get Block'
  blockButton.addEventListener('click', () => {
    const blockData = getBlock()
    copyToClipboard(blockData)
    ws.send(JSON.stringify({
      type: 'blocked',
      msg: blockData
    }))
    alert('send & copy completed')
  })
  document.body.appendChild(blockButton)
}
const getBlock = () => [...document.querySelectorAll('.disabled')].map(v => v.textContent)

// for label test
const toggleReLabel = () => {
  // learning test
  const selectedList = document.querySelectorAll('.selected')
  selectedList.forEach((node, idx) => {
    node.textContent = idx
    node.dataset.label = idx
  })
}

// util
const copyToClipboard = (val) => {
  var t = document.createElement("textarea");
  document.body.appendChild(t);
  t.value = '[' + val + ']';
  t.select();
  document.execCommand('copy');
  document.body.removeChild(t);
}
const isJSON = (str) => {
  try {
    JSON.parse(str)
  } catch (e) {
    return false;
  }
  return true;
}

const init = () => {
  const ws = createWebSocket()
  createMap()
  bindToggleBoxEvent()
  renderPartial(window.__DATA__)

  // create buttons
  createMapButton(ws)
  createSelectedButton(ws)
  createBlockedButton(ws)
}
