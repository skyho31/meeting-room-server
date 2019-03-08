const MIN_VALUE = 4;
const START = '0,0';
const START_COLOR = '#f00';
const END = '3,3';
const END_COLOR = '#00f';

const STORAGE_KEY = 'find_load';
const BACKUP_STORAGE_KEY = STORAGE_KEY + '_' + Date.now();

const $ = (selector, parent = document, isAll = false) => isAll ? parent.querySelectorAll(selector) : parent.querySelector(selector);
const findTd = (row, col) => $(`td:nth-of-type(${col + 1})`, $(`tr:nth-of-type(${row + 1})`, document));
const getPoint = selector => $(selector).value.split(',').map(v => v * 1);

const renderEmpty = () => {
  const rowLength = Number($('#row').value);
  const colLength = Number($('#col').value);

  const newMap = Array.from({length: rowLength}, () => Array.from({length: colLength}, () => 0))
  render(newMap);
};

const onClickTable = event => {
  const target = event.target;
  if (target.nodeName !== 'TD') return;

  if (!target.textContent) {
    target.textContent = 0;
  } else {
    target.textContent = target.textContent === '0' ? 1 : 0;
  }
  save();
};

let isStart = true;
const onContextmenuPoint = event => {
  event.preventDefault();
  const target = event.target;
  if (target.nodeName !== 'TD') return;

  const pos = target.dataset.pos;

  if (isStart) {
    $('#start').value = pos;
    isStart = false;
  } else {
    $('#end').value = pos;
    isStart = true;
  }

  onChangePoint();
};

const onChangeMap = () => {
  let {map} = JSON.parse(localStorage.getItem(STORAGE_KEY));
  const rowLength = Number($('#row').value);
  const colLength = Number($('#col').value);

  if (map.length > rowLength) {
    map.splice(rowLength, map.length);
  } else if (map.length < rowLength) {
    map.push(...Array.from({length: rowLength - map.length}, () => Array.from({length: colLength}, () => 0)));
  }

  if (map[0].length > colLength) {
    map.forEach(row => row.splice(colLength, row.length));
  } else if (map[0].length < colLength) {
    map.forEach(row => {
      row.push(...Array.from({length: colLength - row.length}, () => 0));
    });
  }

  render(map);
};

const onChangePoint = () => {
  const {map, row, col} = JSON.parse(localStorage.getItem(STORAGE_KEY));
  const start = getPoint('#start');
  const end = getPoint('#end');

  if (start.length !== 2 || start[0] < 0 || start[1] < 0 || start[0] > row || start[1] > col) {
    $('#start').value = '0,0';
    onChangePoint();
  }
  if (end.length !== 2 || end[0] < 0 || end[1] < 0 || end[0] > row || end[1] > col) {
    $('#end').value = '0,0';
    onChangePoint();
  }

  render(map);
};

const render = (map) => {
  $('table').innerHTML = map.reduce((acc, row, rowIndex) => {
    return `${acc}<tr>${row.reduce((acc, col, colIndex) => `${acc}<td data-pos="${rowIndex},${colIndex}">${col}</td>`, '')}</tr>`;
  }, '');
  renderPoint();
  save();
};

const renderPoint = () => {
  const start = getPoint('#start');
  if (start.length === 2) {
    findTd(start[0], start[1]).style.backgroundColor = START_COLOR;
  }
  const end = getPoint('#end');
  if (end.length === 2) {
    findTd(end[0], end[1]).style.backgroundColor = END_COLOR;
  }
};

const findPosition = () => {
  const {map} = JSON.parse(localStorage.getItem(STORAGE_KEY));
  const startPoint = getPoint('#start');
  const endPoint = getPoint('#end');

  const path = find(map, startPoint, endPoint);

  render(map);

  path.forEach(([row, col]) => {
    let color = '#ddd';
    if (row === startPoint[0] && col === startPoint[1]) {
      color = START_COLOR;
    }
    if (row === endPoint[0] && col === endPoint[1]) {
      color = END_COLOR;
    }
    findTd(row, col).style.backgroundColor = color;
  });
};

const save = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    row: $('#row').value,
    col: $('#col').value,
    start: $('#start').value,
    end: $('#end').value,
    map: extractMapFromTable()
  }))
  localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify({
    row: $('#row').value,
    col: $('#col').value,
    start: $('#start').value,
    end: $('#end').value,
    map: extractMapFromTable()
  }))
};

const extractMapFromTable = () => {
  const tds = Array.from($('td', $('table'), true));
  const trs = Array.from($('tr', $('table'), true));
  const row = trs.length;
  const col = tds.length / row;

  const map = [];
  for (let i = 0; i < row; i++) {
    map.push(tds.splice(0, col));
  }

  return map.map(row => row.map(col => col.textContent ? col.textContent * 1 : 0));
};

const init = () => {
  if (localStorage.getItem(STORAGE_KEY)) {
    const {
      row,
      col,
      start,
      end,
      map,
    } = JSON.parse(localStorage.getItem(STORAGE_KEY));
    $('#row').value = row;
    $('#col').value = col;
    $('#start').value = start;
    $('#end').value = end;
    render(map);
  } else {
    $('#row').value = MIN_VALUE;
    $('#col').value = MIN_VALUE;
    $('#start').value = START;
    $('#end').value = END;
    renderEmpty();
  }

  $('#row').onclick = onChangeMap;
  $('#col').onclick = onChangeMap;
  $('#start').onchange = onChangePoint;
  $('#end').onchange = onChangePoint;
  $('table').onclick = onClickTable;
  $('table').oncontextmenu = onContextmenuPoint;
};