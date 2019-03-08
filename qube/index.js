/* jslint undef:false */
/* jshint maxerr:200 */
/* global bot,util,console,JSON,setTimeout,setInterval,clearTimeout,clearInterval,escape,unescape,async,await,_,moment,numeral,ss */
/**
 * @author cayde.abdo
 */

/*
// 자세한 사항은 도움말을 참조하세요.
bot.on(키워드, (msg) => {
    bot.send(msg.topic, '떳다떳다 비행기');
});
*/

/*jslint undef:false*/
/*global bot,console,JSON,setTimeout,setInterval,clearTimeout,clearInterval*/
/**
 * @author azki.org
 */

bot.addHelp('meet {회의실이름}', 'cayde');
var mrMap;


function sendMeetingRoom_test(msg, q) {
  // 피드
  const chatBubbleFeed = {
    "feed": {
      "message": "회의실 위치",
      "text": {
        "title": q,
        "description": '[회의실]\n' + q + ' 회의실 정보 : ' + mrMap[q].f + ' ' + mrMap[q].area + ' (' + mrMap[q].p + '명)'
      },
      "images": [{
        "url": mrMap[q].mapUrl ||  "http://images.daumcorp.com/meetingroom/ALL_n07.jpg",
		"width": 120,
		"height": 120
      }],
      "buttons": [{
        "name": "AR로 보기",
        "mobile": "kakaomeetingroom://map?mode=ar&id=" + mrMap[q].id
      },
      {
        "name": "지도보기",
        "mobile": "kakaomeetingroom://map?mode=map&id=" + mrMap[q].id,
      }]
    }
  }
  bot.sendChatBubble(msg.topic, chatBubbleFeed);
}

bot.on(['meet', '밋'], function (msg) {
	var q = msg.content;
	if (mrMap.hasOwnProperty(q)) {
		sendMeetingRoom_test(msg, q);
	} else {
		var m = '[회의실]\n"!{회의실이름}" 형식으로 사용하여 판교 회의실 위치를!!\nex) !가이아\n(가나다 순이니 이름을 보고 정확히 입력)\n\n';
		var nameArr = [];
		for (var n in mrMap) {
			nameArr.push(n);
		}
		nameArr.sort(); // 가나다 순 정렬~
		for (var i = 0; i < nameArr.length; i += 1) {
			if (i > 0) {
				m += ',';
			}
			m += nameArr[i];
		}
		bot.send(msg.topic, m);
	}
});

setTimeout(function () {
	var directFn = function (msg) {
		sendMeetingRoom_test(msg, msg.keyword);
	};
	for (var n in mrMap) {
		bot.on(n, directFn);
	}
}, 1);
				

mrMap = {
  "예스": {
    "id": "259",
    "f": "N7층",
    "area": "Y1",
    "p": "6",
    "mapUrl": "http://t1.daumcdn.net/comis/meetingroom/N07_POP_YELLOW_Yes.jpg"
  },
  "요가": {
    "id": "263",
    "f": "N7층",
    "area": "Y2",
    "p": "6",
    "mapUrl": "http://t1.daumcdn.net/comis/meetingroom/N07_POP_YELLOW_Yoga.jpg"
  },
  "유스": {
    "id": "264",
    "f": "N7층",
    "area": "Y3",
    "p": "8",
    "mapUrl": "http://t1.daumcdn.net/comis/meetingroom/N07_POP_YELLOW_Youth.jpg"
  },
  "영": {
    "id": "265",
    "f": "N7층",
    "area": "Y4",
    "p": "6",
    "mapUrl": "http://t1.daumcdn.net/comis/meetingroom/N07_POP_YELLOW_Young.jpg"
  },
  "욜로": {
    "id": "266",
    "f": "N7층",
    "area": "Y5",
    "p": "4",
    "mapUrl": "http://t1.daumcdn.net/comis/meetingroom/N07_POP_YELLOW_Yolo.jpg"
  },
  "클로에": {
    "id": "267",
    "f": "N7층-외부미팅전용",
    "area": "L1",
    "p": "12",
    "mapUrl": "http://t1.daumcdn.net/comis/meetingroom/N07_POP_LOUNGE_Chloe.jpg"
  },
  "카일": {
    "id": "268",
    "f": "N7층-외부미팅전용",
    "area": "L6",
    "p": "8",
    "mapUrl": "http://t1.daumcdn.net/comis/meetingroom/N07_POP_LOUNGE_Kyle.jpg"
  },
  "제니": {
    "id": "269",
    "f": "N7층-외부미팅전용",
    "area": "L3",
    "p": "8",
    "mapUrl": "http://t1.daumcdn.net/comis/meetingroom/N07_POP_LOUNGE_Jenny.jpg"
  },
  "라이언": {
    "id": "270",
    "f": "N7층-외부미팅전용",
    "area": "L4",
    "p": "6",
    "mapUrl": "http://t1.daumcdn.net/comis/meetingroom/N07_POP_LOUNGE_Ryan.jpg"
  },
  "엘리": {
    "id": "294",
    "f": "N7층-외부미팅전용",
    "area": "L5",
    "p": "8",
    "mapUrl": "http://t1.daumcdn.net/comis/meetingroom/N07_POP_LOUNGE_Ellie.jpg"
  },
  "제이크": {
    "id": "295",
    "f": "N7층-외부미팅전용",
    "area": "L6",
    "p": "12",
    "mapUrl": "http://t1.daumcdn.net/comis/meetingroom/N07_POP_LOUNGE_Jake.jpg"
  },
  "레오": {
    "id": "296",
    "f": "N7층-외부미팅전용",
    "area": "L11",
    "p": "6",
    "mapUrl": "http://t1.daumcdn.net/comis/meetingroom/N07_POP_LOUNGE_Leo.jpg"
  },
  "루씨": {
    "id": "297",
    "f": "N7층-외부미팅전용",
    "area": "L15",
    "p": "8",
    "mapUrl": "http://t1.daumcdn.net/comis/meetingroom/N07_POP_LOUNGE_Lucy.jpg"
  },
  "조이": {
    "id": "298",
    "f": "N7층-외부미팅전용",
    "area": "L7",
    "p": "6",
    "mapUrl": "http://t1.daumcdn.net/comis/meetingroom/N07_POP_LOUNGE_Joy.jpg"
  },
  "클레어": {
    "id": "299",
    "f": "N7층-외부미팅전용",
    "area": "L10",
    "p": "14",
    "mapUrl": "http://t1.daumcdn.net/comis/meetingroom/N07_POP_LOUNGE_Claire.jpg"
  },
  "피터": {
    "id": "300",
    "f": "N7층-외부미팅전용",
    "area": "L13",
    "p": "6",
    "mapUrl": "http://t1.daumcdn.net/comis/meetingroom/N07_POP_LOUNGE_peter.jpg"
  },
  "케빈": {
    "id": "301",
    "f": "N7층-외부미팅전용",
    "area": "L14",
    "p": "6",
    "mapUrl": "http://t1.daumcdn.net/comis/meetingroom/N07_POP_LOUNGE_Kevin.jpg"
  },
  "레프트": {
    "id": "207",
    "f": "N7층-외부미팅전용",
    "area": "B1",
    "p": "4"
  },
  "바이킹": {
    "id": "262",
    "f": "N7층-외부미팅전용",
    "area": "B4",
    "p": "8"
  },
  "보트": {
    "id": "208",
    "f": "N7층-외부미팅전용",
    "area": "B2",
    "p": "4"
  },
  "블랙펄": {
    "id": "213",
    "f": "N7층-외부미팅전용",
    "area": "B11",
    "p": "10"
  },
  "엔데버": {
    "id": "210",
    "f": "N7층-외부미팅전용",
    "area": "B7",
    "p": "6"
  },
  "퀸 메리": {
    "id": "212",
    "f": "N7층-외부미팅전용",
    "area": "B10",
    "p": "6"
  },
  "퀸 엘리자베스": {
    "id": "211",
    "f": "N7층-외부미팅전용",
    "area": "B9",
    "p": "6"
  },
  "페리": {
    "id": "209",
    "f": "N7층-외부미팅전용",
    "area": "B3",
    "p": "14"
  }
}







/*
http://meetingroom.daumcorp.com/main/pan-n9

var a = {};
for (k in sections) {
	s = sections[k];
	a[s.name] = {id:s.orderKey,f:s.floor,area:s.mapFileName.match(/_([^\.]+)\./)[1],p:s.personCapacity};
}
JSON.stringify(a, null, 4);
*/
////////////////////////

