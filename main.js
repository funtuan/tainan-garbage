require('dotenv').config();
require('./service/updateAllGarbage');
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URL, {useNewUrlParser: true});
const {bot} = require('./linebot.js');

const port = process.env.PORT || 80;
console.log(`server start, port: ${port}`);
bot.listen('/webhook', port);
