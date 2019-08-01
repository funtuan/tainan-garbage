const request = require('request');
const TNEPB = 'http://clean.tnepb.gov.tw';

/**
 * 取得區域中的清運點API
 * @param  {String} Area 區域
 * @return {Array}       清運點清單
 */
function getAreaPoint(Area) {
  return new Promise((resolve, reject) => {
    tnepbRequest('/api/ScheduleRoute', {
      Area,
      Period: 0,
      RouteId: 0,
      Week: 0,
    }, 5, (error, json) => {
      if (error) {
        reject(error);
      } else {
        resolve(json);
      }
    });
  });
}

/**
 * 取得單點清運點API
 * @param  {Object} stop 清運點Id
 * @return {Object}      清運點詳細資訊
 */
function getPoint(stop) {
  const RouteId = stop.RouteId;
  const StopId = stop.StopId;
  return new Promise((resolve, reject) => {
    tnepbRequest('/api/SchedulePoint', {
      RouteId,
      StopId,
    }, 5, (error, json) => {
      if (error) {
        reject(error);
      } else {
        json = json.map((one) => {
          one.ScheduleInfo = parseScheduleInfo(one.ScheduleInfo)[0];
          return one;
        });
        const point = {...stop, ...json[0]};
        resolve(point);
      }
    });
  });
}

/**
 * API Request 模型
 * @param  {String}   api      路徑
 * @param  {Object}   form     form參數
 * @param  {Number}   n        重新連接次數
 * @param  {Function} callback callback
 */
function tnepbRequest(api, form, n, callback) {
  request({
    url: TNEPB+api,
    method: 'POST',
    form,
  }, (error, response, body) => {
    const json = JSON.parse(body);
    if (error || json[0].Status) {
      n--;
      if (n > 0) {
        console.log(body);
        console.log(n, '重新載入');
        setTimeout(()=>{
          tnepbRequest(api, form, n, callback);
        }, 3000);
      } else {
        callback(error?error:new Error(json.Status));
      }
    } else {
      callback(false, json);
    }
  });
}

/**
 * 解析清運點時間資訊
 * @param  {Object}  scheduleInfos 清運時間表
 * @return {Object}                清運時間戳表
 */
function parseScheduleInfo(scheduleInfos) {
  return scheduleInfos.map((scheduleInfo) => {
    for (const [key, value] of Object.entries(scheduleInfo)) {
      if (value.indexOf(':') === -1) {
        scheduleInfo[key] = -1;
      } else {
        let time = 0;
        value.split(':').map((one) => {
          time = time * 60;
          time += parseInt(one);
        });
        scheduleInfo[key] = time;
      }
    }
    return scheduleInfo;
  });
}

module.exports = {
  getAreaPoint,
  getPoint,
};
