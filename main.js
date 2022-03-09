
require('dotenv').config()
const { bot } = require('./linebot.js')

const port = process.env.PORT || 80
console.log(`server start, port: ${port}`)
bot.listen('/webhook', port)
