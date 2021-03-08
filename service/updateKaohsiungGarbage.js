
const Point = require('../model/Point');
const request = require('request');
const csv = require('csvtojson');
const kaohsiungGetTrashUrl = 'https://data.kcg.gov.tw/dataset/074c805a-00e1-4fc5-b5f8-b2f4d6b64aa4/resource/a6ba725a-488c-4d40-b5a2-c2fe65d3e134/download/ksepb.csv';


/**
 *
 * @param {*} one 清運點資訊
 */
async function updatePoint(one) {
  const pid = `kaohsiung:${one.id}`;
  const timeText = one.停留時間.split('-')[0];
  let time;
  if (timeText.indexOf(':') === -1) {
    time = parseInt(timeText.substr(0, 2)) * 60 +
      parseInt(timeText.substr(2, 2));
  } else {
    time = parseInt(timeText.split(':')[0]) * 60 + parseInt(timeText.split(':')[1]);
  }
  const obj = {
    pid,
    name: one.停留地點,
    addr: one.停留地點,
    area: one.行政區,
    lat: one.緯度,
    lon: one.經度,
    schedule: {
      mon: {
        open: true,
        time,
        recycle: one.回收日.indexOf('一') !== -1,
      },
      tue: {
        open: true,
        time,
        recycle: one.回收日.indexOf('二') !== -1,
      },
      wed: {
        open: false,
      },
      thu: {
        open: true,
        time,
        recycle: one.回收日.indexOf('四') !== -1,
      },
      fri: {
        open: true,
        time,
        recycle: one.回收日.indexOf('五') !== -1,
      },
      sat: {
        open: true,
        time,
        recycle: one.回收日.indexOf('六') !== -1,
      },
      sun: {
        open: false,
      },
    },
    ref: '高雄市環境保護局',
  };
  if (obj.lat !== '' && obj.lon !== '') {
    await Point.updateOne({
      pid,
    }, obj, {upsert: true, setDefaultsOnInsert: true});
  }
}

module.exports = async () => {
  console.log('updateKaohsiungGarbage start');
  let id = 1;
  csv()
      .fromStream(request.get(kaohsiungGetTrashUrl))
      .subscribe( async (json)=>{
        updatePoint({
          id,
          ...json,
        });
        id++;
      }, (error) => {
        console.log(error);
      }, () => {
        console.log('updateKaohsiungGarbage end');
      });
};
