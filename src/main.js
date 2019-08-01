const {bot} = require('./linebot.js');

console.log('server start!');
bot.listen('/tainan-garbage', 3000);
