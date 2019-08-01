const MongoClient = require('mongodb').MongoClient;
const URL = 'mongodb://mongo:27017';
const DAYLIST = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYLISTCT = ['日', '一', '二', '三', '四', '五', '六'];

class GarbageDB {
  constructor() {
    this.DBname = 'garbage';
    this.db = {};
    this.pointCol = {};
    console.log('constructor');
  }

  connect(callback) {
    MongoClient.connect(URL, { useNewUrlParser: true }, (err, client) => {
      if (err) throw err;
      console.log("connect mongodb");
      this.db = client.db(this.DBname);
      this.pointCol = this.db.collection('point');
      callback();
    });
  }

  addPoint(point) {
    this.pointCol.updateOne({
      RouteId: point.RouteId,
      StopId: point.StopId,
    },{
      $set: point,
    },{
      upsert: true
    });
  }

  getPointsByTime(at, min, max) {
    return new Promise((resolve, reject) => {
      const day = DAYLIST[at.getDay()];
      const time = at.getHours()*60 + at.getMinutes();
      const andQuery = [];

      // 該星期不等於 -1
      andQuery[0] = {};
      andQuery[0]['ScheduleInfo.'+day] = { $ne : -1 };

      // 大於小於分界
      andQuery[1] = {};
      andQuery[2] = {};
      andQuery[1]['ScheduleInfo.'+day] = { $gt : time+min };
      andQuery[2]['ScheduleInfo.'+day] = { $lt : time+max };

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
