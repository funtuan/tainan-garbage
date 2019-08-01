const linebot = require('linebot');
const moment = require('moment');
const {LoadData} = require('./loadData/main.js');
const config = require('./config.js');
const lineTemplate = require('./lineTemplate.js');


// const area = [{"Area":"學甲區","Lon":120.182505,"Lat":23.230472},{"Area":"歸仁區","Lon":120.294255,"Lat":22.967241},{"Area":"關廟區","Lon":120.327561,"Lat":22.962892},{"Area":"鹽水區","Lon":120.266122,"Lat":23.320031}];
const loadData = new LoadData();
loadData.init().then(()=>{
  // let task = Promise.resolve();
  // area.map((one)=>{
  //   console.log(one.Area, 'loadAllAreaPoint ok!');
  //   task = task.then(()=>{
  //     return loadData.loadAllAreaPoint(one.Area);
  //   });
  // });
  // return task();
}).then(()=>{
  console.log('loadAllAreaPoint ok!');
});

const bot = linebot({
  channelId: config.CHANNEL_ID,
  channelSecret: config.CHANNEL_SECRET,
  channelAccessToken: config.CHANNEL_ACCESS_TOKEN,
});

bot.on('message', function (event) {
  console.log(new Date().toLocaleString());
  // console.log(event.message);
  if ( event.message.type === 'location') {
    const lat = event.message.latitude,
          lon = event.message.longitude;
    loadData.getNicePoint (new Date(), lat, lon).then((points)=>{
      console.log(event.message.address, lat, lon, '附近數量：', points.length);
      const json = {
        type: 'list',
        lat,
        lon,
      };
      if (points.length === 0) {
        return event.reply(lineTemplate.fountNot(json, new Date()));
      }
      return event.reply(lineTemplate.rankSelect(`近期有 ${points.length} 個垃圾清運點`, json));
      // return event.reply(lineTemplate.stopList(points));
    })

  } else {
    if (event.source.type === 'user' && event.message.text && event.message.text.indexOf(':') === -1) {
      console.log(event);
      // event.reply('想追垃圾車？請點選左下角『＋』\n在位置資訊選擇你目前位置．').then(function (data) {
      // }).catch(function (error) {
      // });
      return event.reply(lineTemplate.msgMeun());
    }
  }
});

bot.on('postback', function (event) {
  const json = JSON.parse(event.postback.data);
  let datetime = new Date();
  if (event.postback.params && event.postback.params.datetime) {
    datetime = new Date(event.postback.params.datetime);
  }else if (json.datetime) {
    datetime = new Date(json.datetime);
  }
  console.log(event.postback);
  if (json.type) {
    switch (json.type) {
      case 'show':
        loadData.showPoint(json).then((p)=>{
          return event.reply(lineTemplate.location(p.StopAddr, `表定時間：${Math.floor(p.atTime/60)}:${p.atTime%60<10?'0'+p.atTime%60:p.atTime%60} （${p.recycle?'有回收':'無回收'}）\n資料來源：台南垃圾清運查詢系統`, p.Lat, p.Lon));
        });
        break;
      case 'list':
        loadData.getNicePoint (datetime, json.lat, json.lon, json.minm).then((points)=>{
          if (points.length === 0) {
            return event.reply(lineTemplate.fountNot(json, datetime));
          }
          return event.reply(lineTemplate.stopList(points, json.label, datetime));
        });
        break;
      case 'selectTime':
        loadData.getNicePoint (datetime, json.lat, json.lon).then((points)=>{
          // console.log(event.message.address, json.lat, json.lon, '附近數量：', points.length);
          if (points.length === 0) {
            return event.reply(lineTemplate.fountNot(json, datetime));
          }
          const selectJson = {
            type: 'list',
            lat: json.lat,
            lon: json.lon,
            datetime,
          };
          return event.reply(lineTemplate.rankSelect(`${moment(datetime).format('MM月DD日 HH:mm')} 有 ${points.length} 個垃圾清運點`, selectJson));
        });
        // return event.reply('功能尚未開放，敬請期待');
        break;
      default:

    }
  }
});

module.exports = {
  bot,
}
