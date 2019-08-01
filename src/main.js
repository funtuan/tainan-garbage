const { bot } = require('./linebot.js');

console.log('ok!');
bot.listen('/tainan-garbage', 3000);
