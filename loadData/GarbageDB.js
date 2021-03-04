const MongoClient = require('mongodb').MongoClient;
const URL = 'mongodb://mongo:27017';
const DAYLIST = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYLISTCT = ['日', '一', '二', '三', '四', '五', '六'];

/**
 * 清運點資料庫
 */
class GarbageDB {
  /**
   * 初始化
   */
  constructor() {
    this.DBname = 'garbage';
    this.db = {};
    this.pointCol = {};
    console.log('constructor');
  }

  /**
   * 連線
   * @param  {Function} callback callback
   */
  connect(callback) {
    MongoClient.connect(URL, {useNewUrlParser: true}, (err, client) => {
      if (err) throw err;
      console.log('connect mongodb');
      this.db = client.db(this.DBname);
      this.pointCol = this.db.collection('point');
      callback();
    });
  }

  /**
   * 新增清運點
   * @param {Object} point 清運點資訊
   */
  addPoint(point) {
    this.pointCol.updateOne({
      RouteId: point.RouteId,
      StopId: point.StopId,
    }, {
      $set: point,
    }, {
      upsert: true,
    });
  }

  /**
   * 經由時間取得清運點
   * @param  {Object} at  時間
   * @param  {Number} min 最小時間
   * @param  {Number} max 最大時間
   * @return {Array}      清運點資訊
   */
  getPointsByTime(at, min, max) {
    return new Promise((resolve, reject) => {
      const day = DAYLIST[at.getDay()];
      const time = at.getHours()*60 + at.getMinutes();
      const andQuery = [];

      // 該星期不等於 -1
      andQuery[0] = {};
      andQuery[0]['ScheduleInfo.'+day] = {$ne: -1};

      // 大於小於分界
      andQuery[1] = {};
      andQuery[2] = {};
      andQuery[1]['ScheduleInfo.'+day] = {$gt: time+min};
      andQuery[2]['ScheduleInfo.'+day] = {$lt: time+max};

      this.pointCol.find({$and: andQuery}).toArray((err, result) => {
        if (err) {
          reject(err);
        } else {
          result = result.map((one) => {
            // console.log(one);
            one.recycle = one['RecycleDate'].indexOf(DAYLISTCT[at.getDay()]) !== -1;
            one.atTime = one['ScheduleInfo'][day];
            one.lastTime = one['ScheduleInfo'][day] - time;
            return one;
          });
          resolve(result);
        }
      });
    });
  }

  /**
   * 經由Id取得的清運點
   * @param  {Object} at      時間
   * @param  {Number} RouteId 路線id
   * @param  {Number} StopId  清運點id
   * @return {Object}         清運點資訊
   */
  getPointById(at, RouteId, StopId) {
    return new Promise((resolve, reject) => {
      const day = DAYLIST[at.getDay()];
      const time = at.getHours()*60 + at.getMinutes();
      this.pointCol.findOne({RouteId, StopId}, (err, result) => {
        if (err) {
          reject(err);
        } else {
          result.recycle = result['RecycleDate'].indexOf(DAYLISTCT[at.getDay()]) !== -1;
          result.atTime = result['ScheduleInfo'][day];
          result.lastTime = result['ScheduleInfo'][day] - time;
          resolve(result);
        }
      });
    });
  }
}

exports.GarbageDB = GarbageDB;
