const $ = selector => document.querySelector(selector);
const moveTo = path => (window.location = path);

const changeRoomInfo = () => {
  const {code, name, people, desc} = MEETING_ROOM[currentPosition];
  $('.room_code').textContent = code;
  $('.room_name').textContent = `${name} 회의실`;
  $('.room_photo img').setAttribute('src', `${PATH_PHOTO}/${code}.jpg`);
  $('.room_detail').innerHTML = `
          <li><img src="./meetingroom/people.png">${people}명 가능</li>
          <li>${desc || '&nbsp;'}</li>
        `;
  $('.room_map img').setAttribute('src', `${PATH_MAP}/${code}.png`);
};

const moveToPrev = () => {
  currentPosition--;
  if (currentPosition < 0) {
    currentPosition = MEETING_ROOM.length - 1;
  }
  changeRoomInfo();
}
const moveToNext = () => {
  currentPosition++;
  if (currentPosition >= MEETING_ROOM.length) {
    currentPosition = 0;
  }
  changeRoomInfo();
}

let currentPosition = 0;
document.addEventListener("DOMContentLoaded", () => {
  changeRoomInfo();

  $('.room_prev').onclick = moveToPrev;
  $('.room_next').onclick = moveToNext;
  $('.room_ar').onclick = () => {
    // moveTo('');
  }
  $('.room_map').onclick = () => {
    moveTo(`./index.html?pos=${currentPosition}`);
  }
});