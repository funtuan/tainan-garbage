const delay = require('delay');
const tnepb = require('../api/tnepb');
const Point = require('../model/Point');
const {
  getAreas,
  getAreaPoint,
  getPoint,
} = tnepb;

/**
 *
 * @param {*} point 清運點資訊
 */
async function updatePoint({
  Area,
  StopId,
  StopName,
  ScheduleInfo,
  StopAddr,
  Lon,
  Lat,
}) {
  const pid = `tainan:${StopId}`;
  const obj = {
    pid,
    name: StopName,
    addr: StopAddr,
    area: Area,
    lat: Lat,
    lon: Lon,
    schedule: {
      mon: ScheduleInfo.Mon,
      tue: ScheduleInfo.Tue,
      wed: ScheduleInfo.Wed,
      thu: ScheduleInfo.Thu,
      fri: ScheduleInfo.Fri,
      sat: ScheduleInfo.Sat,
      sun: ScheduleInfo.Sun,
    },
    ref: '台南垃圾清運查詢系統',
  };
  await Point.updateOne({pid}, obj, {upsert: true, setDefaultsOnInsert: true});
}

module.exports = async () => {
  const areas = (await getAreas()).filter((one) => one.Area !== '龍崎區');

  for (const area of areas) {
    const points = await getAreaPoint(area.Area);
    console.log(area.Area, points.length);
    console.log(area.Area, 'load');
    for (const point of points) {
      const data = await getPoint(point);
      await updatePoint(data);
    }
    console.log(area.Area, 'ok');
    await delay(10000);
  }
};
