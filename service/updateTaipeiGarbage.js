const axios = require('axios');
const Point = require('../model/Point');
const parseString = require('xml2js').parseString;
const taipeiGetTrashUrl = 'http://www.dep-in.gov.taipei/epb/webservice/webservice.asmx/GetTrash';


/**
 *
 * @param {*} one 清運點資訊
 */
async function updatePoint(one) {
  const pid = `taipei:${one['$']['diffgr:id'].replace('Table', '')}`;
  const timeAreaText = one['Content'][0].split('時間：')[1];
  const timeText = timeAreaText.split('-')[0];
  let time;
  if (timeText.indexOf(':') === -1) {
    time = parseInt(timeText.substr(0, 2)) * 60 +
      parseInt(timeText.substr(2, 2));
  } else {
    time = parseInt(timeText.split(':')[0]) * 60 + parseInt(timeText.split(':')[1]);
  }
  const obj = {
    pid,
    name: one['Title'][0].replace('垃圾清運點：', ''),
    addr: one['Title'][0].replace('垃圾清運點：', ''),
    area: '台北市',
    lat: one['Lat'][0],
    lon: one['Lng'][0],
    schedule: {
      mon: {
        open: true,
        time,
        recycle: false,
      },
      tue: {
        open: true,
        time,
        recycle: false,
      },
      wed: {
        open: false,
      },
      thu: {
        open: true,
        time,
        recycle: false,
      },
      fri: {
        open: true,
        time,
        recycle: false,
      },
      sat: {
        open: true,
        time,
        recycle: false,
      },
      sun: {
        open: false,
      },
    },
    ref: one['Unit'][0],
  };
  await Point.updateOne({pid}, obj, {upsert: true, setDefaultsOnInsert: true});
}

module.exports = async () => {
  console.log('updateTaipeiGarbage start');
  const res = await axios.get(taipeiGetTrashUrl);
  parseString(res.data, async (err, json) => {
    const lowData = json['DataTable']['diffgr:diffgram'][0]['NewDataSet'][0]['Table'];
    for (const one of lowData) {
      await updatePoint(one);
    }
    console.log('updateTaipeiGarbage end');
  });
};
