const moment = require('moment');
const config = require('./config.js');

module.exports = {
  location(title, address, lat, lon) {
    return {
      'type': 'location',
      'title': title,
      'address': address,
      'latitude': lat,
      'longitude': lon,
    };
  },

  stopList(points, labal='追垃圾車', datetime) {
    let i = 0;
    const columns = [];
    const textArray = [
      moment(datetime).format('查詢時間：MM月DD日 HH:mm 後'),
      '＊ 表示該垃圾清運點有回收車',
      '台南垃圾車不一定準時，請多碰運氣',
      `過濾條件：${config.MAXTIME}小時內 & ${config.MAXRANGE}公里內`,
    ];
    while (points.length/3 > i && i < 9) {
      const actions = [];
      let text = '';
      for (let k = 0; k < 3; k++) {
        const p = points[i*3+k];
        if (p) {
          text = text + `${Math.floor(p.time/60)}:${p.time%60<10?'0'+p.time%60:p.time%60} ${p.addr}\n`;
          actions.push({
            'type': 'postback',
            // "label": `${Math.floor(p.time/60)}:${p.time%60<10?'0'+p.time%60:p.time%60} 距離${Math.ceil(p.distance)}m ${p.recycle?'有回收':'無回收'}`,
            'label': `${p.recycle?'＊':''}${Math.floor(p.time/60)}:${p.time%60<10?'0'+p.time%60:p.time%60} 離${Math.ceil(p.distance)}m ${p.addr.substr(0, 4)}..`,
            'text': `${Math.floor(p.time/60)}:${p.time%60<10?'0'+p.time%60:p.time%60} ${p.addr}`,
            'data': JSON.stringify({
              'type': 'show',
              'pid': p.pid,
              datetime,
            }),
          });
        }
      }
      while (actions.length < 3) {
        actions.push({
          'type': 'message',
          'label': ` `,
          'text': ` `,
        });
      }
      columns.push({
        'title': `${labal}地點 ${i*3+1}~${points.length > i*3+3?i*3+3:points.length} （${points.length}）`,
        'text': textArray[i%textArray.length],
        'actions': actions,
      });
      i++;
    }

    columns.push({
      'title': `更多功能`,
      'text': '追垃圾車已經無法滿足我了',
      'actions': [{
        'type': 'uri',
        'label': '想不開？來官方清運查詢',
        'uri': 'http://clean.tnepb.gov.tw/GarbageTruckLiveFeed/',
      }, {
        'type': 'uri',
        'label': 'Ptt其他大神製清運查詢',
        'uri': 'https://clean.goodideas-studio.com/',
      }, {
        'type': 'uri',
        'label': `問題回報`,
        'uri': `https://forms.gle/qmnxAKPzc8aoBZH17`,
      }],
    });

    return {
      'type': 'template',
      'altText': '快點，這附近還有在收垃圾！',
      'template': {
        'type': 'carousel',
        'actions': [],
        'columns': columns,
      },
    };
  },

  fountNot(json, datetime) {
    return {
      'type': 'template',
      'altText': '孩子哭泣吧！這時間沒垃圾車',
      'template': {
        'type': 'buttons',
        'actions': [{
          'type': 'uri',
          'label': '想不開？來官方清運查詢',
          'uri': 'http://clean.tnepb.gov.tw/GarbageTruckLiveFeed/',
        }, {
          'type': 'uri',
          'label': 'Ptt其他大神製清運查詢',
          'uri': 'https://clean.goodideas-studio.com/',
        }, {
          'type': 'datetimepicker',
          'label': '選擇其他時間',
          'data': JSON.stringify({
            ...json,
            type: 'selectTime',
          }),
          'mode': 'datetime',
          'initial': moment(datetime).format('YYYY-MM-DDtHH:mm'),
          'max': moment(+new Date + 7*24*60*60*1000).format('YYYY-MM-DDtHH:mm'),
          'min': moment().format('YYYY-MM-DDtHH:mm'),
        }, {
          'type': 'uri',
          'label': `問題回報`,
          'uri': `https://forms.gle/qmnxAKPzc8aoBZH17`,
        }],
        'title': '孩子哭泣吧！這時間沒垃圾車',
        'text': `${moment(datetime).format('查詢時間：MM月DD日 HH:mm 後')}\n${config.MAXTIME}小時內沒垃圾車想靠近你${config.MAXRANGE}公里！\n也可以嘗試以下方法查詢定點資訊`,
      },
    };
  },

  msgMeun() {
    return {
      'type': 'template',
      'altText': '想找台南垃圾車？',
      'template': {
        'type': 'buttons',
        'actions': [{
          'type': 'location',
          'label': '開始查詢',
        }],
        'title': '想找台南垃圾車？',
        'text': `使用此功能需要取得您gps定位`,
      },
    };
  },

  rankSelect(title, json) {
    return {
      'type': 'template',
      'altText': title,
      'template': {
        'type': 'buttons',
        'actions': [
          {
            'type': 'postback',
            'label': '最佳排序',
            'data': JSON.stringify({
              label: '最佳排序',
              ...json,
              minm: 6,
            }),
          }, {
            'type': 'postback',
            'label': '不想走太遠',
            'data': JSON.stringify({
              label: '不想走太遠',
              ...json,
              minm: 200,
            }),
          }, {
            'type': 'postback',
            'label': '不想等太久',
            'data': JSON.stringify({
              label: '不想等太久',
              ...json,
              minm: 1,
            }),
          }, {
            'type': 'datetimepicker',
            'label': '選擇其他時間',
            'data': JSON.stringify({
              ...json,
              type: 'selectTime',
            }),
            'mode': 'datetime',
            'initial': moment().format('YYYY-MM-DDtHH:mm'),
            'max': moment(+new Date + 7*24*60*60*1000).format('YYYY-MM-DDtHH:mm'),
            'min': moment().format('YYYY-MM-DDtHH:mm'),
          },
        ],
        'title': title,
        'text': '你想怎麼排序？',
      },
    };
  },
};
