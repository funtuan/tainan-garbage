const config = require('../config.js');
const {GarbageDB} = require('./GarbageDB.js');
const {getAreaPoint, getPoint} = require('../api/tnepb.js');

// 每分鐘移動最大距離
const MINM = 250;

/**
 * 資料獲取物件
 */
class LoadData {
  /**
   * 初始化
   */
  constructor() {
    this.garbageDB = new GarbageDB();
  }

  /**
   * 建立資料庫連線
   * @return {null} null
   */
  init() {
    return new Promise((resolve, reject) => {
      this.garbageDB.connect(() => {
        resolve();
      });
    });
  }

  /**
   * 載入區域內所有清運點資料
   * @param  {String} area 區域名稱中文
   * @return {null}        null
   */
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

  /**
   * 取得最適合清運點
   * @param  {Object} time     時間
   * @param  {Float}  lat      經度
   * @param  {Float}  lon      緯度
   * @param  {Number} minm     距離時間行為參數
   * @return {Array}           清運點清單
   */
  getNicePoint(time, lat, lon, minm=1) {
    return new Promise((resolve, reject) => {
      this.garbageDB.getPointsByTime(new Date(time), 1, config.MAXTIME*60)
          .then((points)=>{
            // 計算距離
            points = points.map((point) => {
              point.distance = distanceCalc(point.Lat, lat, point.Lon, lon);
              point.rank = point.lastTime + point.distance * 2 * minm / MINM;
              return point;
            });

            // 過濾會 錯過的收取點
            points = points.filter((point) => {
              return point.lastTime-1 > point.distance / MINM &&
                  point.distance < config.MAXRANGE*1000;
            });

            points.sort((a, b) => {
              return a.rank - b.rank;
            });

            resolve(points);
          });
    });
  }

  /**
   * 取得單一清運點
   * @param  {String} RouteId 路線Id
   * @param  {String} StopId  清運點Id
   * @return {Object}         清運點資訊
   */
  showPoint({RouteId, StopId}) {
    return this.garbageDB.getPointById(new Date(), RouteId, StopId);
  }
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

exports.LoadData = LoadData;
