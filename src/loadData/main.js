const config = require('../config.js');
const { GarbageDB } = require('./GarbageDB.js');
const { getAreaPoint, getPoint} = require('./tnepb-api.js');

// 每分鐘移動最大距離
const MINM = 250;

class LoadData {
  constructor() {
    this.garbageDB = new GarbageDB();
  }

  init() {
    return new Promise((resolve, reject) => {
      this.garbageDB.connect(() => {
        resolve();
      });
    });
  }

  loadAllAreaPoint(area) {
    return new Promise((resolve, reject) => {
      getAreaPoint(area).then((json)=>{
        const task = json.map((stop) => getPoint(stop));
        console.log('數量為', task.length);
        Promise.all(task).then((points)=>{
          points.map((point) => {
            this.garbageDB.addPoint(point);
          });
          resolve();
        });
      });
    });
  }

  getNicePoint (time, lat, lon, minm=1) {
    return new Promise((resolve, reject) => {
      this.garbageDB.getPointsByTime(new Date(time), 1, config.MAXTIME*60).then((points)=>{

        // 計算距離
        points = points.map((point) => {
          point.distance = distanceCalc(point.Lat, lat, point.Lon, lon);
          point.rank = point.lastTime + point.distance * 2 * minm / MINM ;
          return point;
        });

        // 過濾會 錯過的收取點
        points = points.filter((point) => {
          return point.lastTime-1 > point.distance / MINM && point.distance < config.MAXRANGE*1000;
        });

        points.sort((a, b) => {
          return a.rank - b.rank;
        });

        resolve(points);
      });
    });
  }

  showPoint ({RouteId, StopId}) {
    return this.garbageDB.getPointById(new Date(), RouteId, StopId);
  }
}

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

exports.LoadData = LoadData;
