const axios = require('axios');
const Point = require('../model/Point');
const parseString = require('xml2js').parseString;
const newTaipeiGetTrashUrl = 'https://data.ntpc.gov.tw/api/datasets/EDC3AD26-8AE7-4916-A00B-BC6048D19BF8/json';


/**
 *
 * @param {*} one 清運點資訊
 */
async function updatePoint(one) {
  const pid = `newtaipei:${one.lineId}:${one.rank}`;
  const time = parseInt(one.time.split(':')[0]) * 60 + parseInt(one.time.split(':')[1]);
  const obj = {
    pid,
    name: one.name,
    addr: one.name,
    area: one.city,
    lat: one.latitude,
    lon: one.longitude,
    schedule: {
      mon: {
        open: one.garbageMonday === 'Y',
        time,
        recycle: one.recyclingMonday === 'Y',
      },
      tue: {
        open: one.garbageTuesday === 'Y',
        time,
        recycle: one.recyclingTuesday === 'Y',
      },
      wed: {
        open: one.garbageWednesday === 'Y',
        time,
        recycle: one.recyclingWednesday === 'Y',
      },
      thu: {
        open: one.garbageThursday === 'Y',
        time,
        recycle: one.recyclingThursday === 'Y',
      },
      fri: {
        open: one.garbageFriday === 'Y',
        time,
        recycle: one.recyclingFriday === 'Y',
      },
      sat: {
        open: one.garbageSaturday === 'Y',
        time,
        recycle: one.recyclingSaturday === 'Y',
      },
      sun: {
        open: one.garbageSunday === 'Y',
        time,
        recycle: one.recyclingSunday === 'Y',
      },
    },
    ref: '新北市政府環境保護局',
  };
  await Point.updateOne({pid}, obj, {upsert: true, setDefaultsOnInsert: true});
}

module.exports = async () => {
  console.log('updateNewTaipeiGarbage start');
  let run = true;
  let page = 0;
  while (run) {
    const res = await axios.get(newTaipeiGetTrashUrl + `?page=${page}`);
    for (const one of res.data) {
      await updatePoint(one);
    }
    if (res.data.length === 0) {
      run = false;
    }
    page++;
  }
  console.log('updateNewTaipeiGarbage end');
};
