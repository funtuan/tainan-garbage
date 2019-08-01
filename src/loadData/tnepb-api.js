const request = require('request');
const TNEPB = 'http://clean.tnepb.gov.tw';

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

function tnepbRequest(api, form, n, callback) {
  request({
    url: TNEPB+api,
    method: "POST",
    form,
  }, (error, response, body) => {
    let json = JSON.parse(body);
    if (error || json[0].Status) {
      n--;
      if (n > 0) {
        console.log(body);
        console.log(n, '重新載入');
        setTimeout(()=>{
          tnepbRequest(api, form, n, callback)
        }, 3000);
      } else {
        callback(error?error:new Error(json.Status));
      }
    } else {
      callback(false, json);
    }
  });
}

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
