const Point = require('../model/Point');
const cache = require('../utils/cache');

// 每分鐘移動最大距離
const MINM = 250;
const MAXTIME = 6 * 60;
const DAYLIST = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

/**
 *
 * @param {*} dimension 維度
 * @param {*} lat   緯度
 * @param {*} lon   經度
 * @return {Object} 中心經緯度
 */
function centerLatLon(dimension, {
  lat,
  lon,
}) {
  const dd = 1/dimension;
  return {
    lat: Math.round(lat*dd)/dd,
    lon: Math.round(lon*dd)/dd,
  };
}

/**
 *
 * @param {*} lat 中心緯度
 * @param {*} lon 中心經度
 * @param {*} range 經緯度範圍
 * @param {*} week 查詢星期
 * @param {*} timeStart 開始時間
 * @param {*} timeEnd 結束時間
 */
async function loadPoint(lat, lon, range, week) {
  const cacheKey = `loadPoint:${lat}:${lon}:${range}:${week}`;
  const cacheData = cache.get(cacheKey);
  if (cacheData) return cacheData;
  const filter = {};
  filter[`schedule.${week}.open`] = true;
  filter[`lat`] = {
    '$gte': strip(lat - range),
    '$lt': strip(lat + range),
  };
  filter[`lon`] = {
    '$gte': strip(lon - range),
    '$lt': strip(lon + range),
  };
  const points = await Point.find(filter);

  cache.set(cacheKey, points);
  return points;
}

/**
 *
 * @param {number} number 浮點數
 * @return {number} 浮點數
 */
function strip(number) {
  return parseFloat(parseFloat(number).toPrecision(12));
}

/**
 * 經緯度計算距離
 * @param  {Float} lat1 經度１
 * @param  {Float} lat2 經度２
 * @param  {Float} lon1 緯度１
 * @param  {Float} lon2 緯度２
 * @return {Float}      距離
 */
function distanceCalc(lat1, lat2, lon1, lon2) {
  const R = 6371;
  const dLat = (lat2-lat1) * Math.PI / 180;
  const dLon = (lon2-lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
  Math.cos(lat1 * Math.PI / 180 ) * Math.cos(lat2 * Math.PI / 180 ) *
  Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c;
  // console.log(lat1, lat2, lon1, lon2);
  return d*1000;
}

/**
 *
 * @param {*} date 時間
 * @param {*} pid  清運點ID
 */
async function findOne(date, pid) {
  const week = DAYLIST[date.getDay()];
  const time = date.getHours(date) + date.getMinutes(date);
  const point = await Point.findOne({
    pid,
  });
  point.recycle = point.schedule[week].recycle;
  point.time = point.schedule[week].time;
  point.countdownTime = point.time - time;

  return point;
}

/**
 *
 * @param {*} lat 中心緯度
 * @param {*} lon 中心經度
 */
async function search({
  lat,
  lon,
  date,
  minm,
}) {
  const week = DAYLIST[date.getDay()];
  const time = date.getHours(date) * 60 + date.getMinutes(date);
  const targets = [];

  const cell = 7;
  const cellLength = 0.015;
  const center = centerLatLon(cellLength, {
    lat,
    lon,
  });

  const centerIndex = (cell-1) / 2;
  for (let i = 0; i < cell; i++) {
    for (let k = 0; k < cell; k++) {
      if (Math.abs(i-centerIndex) + Math.abs(k-centerIndex) <= centerIndex) {
        targets.push({
          lat: strip(center.lat + (i - (cell-1)/2) * cellLength),
          lon: strip(center.lon + (k - (cell-1)/2) * cellLength),
        });
      }
    }
  }

  let points = [];
  for (const target of targets) {
    const row = await loadPoint(target.lat, target.lon, cellLength/2, week);
    points = [
      ...points,
      ...row,
    ];
  }

  points = points.map((point) => {
    point.recycle = point.schedule[week].recycle;
    point.time = point.schedule[week].time;
    point.countdownTime = point.time - time;
    return point;
  });

  // 過濾會時間內的清運點
  points = points.filter((point) => {
    return point.time > time + 1 && point.time < time + MAXTIME;
  });

  points = points.map((point) => {
    point.distance = distanceCalc(point.lat, lat, point.lon, lon);
    point.rank = point.countdownTime + point.distance * 2 * minm / MINM;
    return point;
  });

  // 過濾會到不了的清運點
  points = points.filter((point) => {
    return point.countdownTime-1 > point.distance / MINM;
  });

  points.sort((a, b) => {
    return a.rank - b.rank;
  });

  return points;
}

module.exports = {
  findOne,
  search,
  loadPoint,
  centerLatLon,
};
