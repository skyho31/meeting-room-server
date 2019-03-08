// global variable
const container = document.getElementById("container");
const LENGTH = 1584
const COLUMN_LENGTH = 72
const ROW_LENGTH = 22


// const blockedList = window.__BLOCK__
const pointList = ["167","168","169","170","171","172","173","174","175","176","177","178","179","180","181","182","183","184","185","186","187","188","239","243","244","247","249","311","315","319","321","382","383","384","387","391","393","455","463","465","527","528","535","537","569","597","598","599","600","601","602","603","604","605","606","607","608","609","610","611","612","613","614","615","616","617","618","619","620","621","622","623","624","625","626","627","669","675","679","687","691","698","741","747","751","759","763","770","813","819","823","831","835","842","885","891","895","903","907","914","957","958","959","960","961","962","963","964","965","966","967","968","969","970","971","972","973","974","975","976","977","978","979","980","981","982","983","984","985","986","987","1035","1038","1039","1041","1046","1047","1106","1107","1111","1113","1119","1176","1177","1178","1179","1183","1185","1191","1250","1251","1255","1257","1258","1262","1263","1323","1327","1329","1335","1393","1394","1395","1396","1397","1398","1399","1400","1401","1402","1403","1404","1405","1406","1407"]

// map function
const createMap = () => {
  for (let i = 0; i < LENGTH; i++) {
    const box = document.createElement("div");  
    if (pointList.includes(String(i))) {
      box.className = "selected box";
    } 
    // else if(blockedList.includes(i)) {
    //   box.className = "disabled box";
    // } 
    else {
      box.className = "disabled box";
    }
    box.dataset.number = i;
    box.textContent = i;
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

const movePosition = gridNumber => {
  const pos = document.querySelectorAll('.here')
  pos.forEach(el => el.classList.remove('here'))

  const target = document.querySelector(`.selected[data-number='${gridNumber}']`)
  target.classList.add('here')
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
  createMap()
}

const renderPath = (jsonArray) => {
  let path = []
  
  if(isJSON(jsonArray)) {
    path = JSON.parse(jsonArray)
  } else {
    path = jsonArray
  }

  renderPartial(path, 2)
}

const renderCurrentLocation = (curPos) => {
  const position = Number(curPos)
  renderPartial(position, 3)
}
