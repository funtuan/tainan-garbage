const CronJob = require('cron').CronJob;
const cache = require('../utils/cache');
const updateTaipeiGarbage = require('./updateTaipeiGarbage');
const updateNewTaipeiGarbage = require('./updateNewTaipeiGarbage');
const updateTainanGarbage = require('./updateTainanGarbage');
const updateKaohsiungGarbage = require('./updateKaohsiungGarbage');

// 每天執行更新
const job = new CronJob(process.env.UPDATE_GARBAGE_TIME, async () => {
  await updateKaohsiungGarbage();
  await updateTainanGarbage();
  await updateTaipeiGarbage();
  await updateNewTaipeiGarbage();
  cache.reset();
}, null, true, 'Asia/Taipei');
job.start();
