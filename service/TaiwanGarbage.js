
const axios = require('axios')
const hash = require('object-hash')

class TaiwanGarbage {
  constructor({
    rawlink = 'https://raw.githubusercontent.com/funtuan/taiwan-garbage-opendata/open-data/data/all.json',
    maxDistance = 5 * 1000,
    MINM = 250,
    MAXTIME = 6 * 60,
  } = {}) {
    this.rawlink = rawlink
    this.maxDistance = maxDistance
    this.alldata = []
    this.weekdata = [[], [], [], [], [], [], []]
    this.MINM = MINM
    this.MAXTIME = MAXTIME
  }

  async load() {
    const data = ((await axios.get(this.rawlink)).data).map((item) => {
      return {
        pid: hash(item),
        ...item,
      }
    })
    this.alldata = data
    for (let day = 0; day < 7; day++) {
      this.weekdata[day] = data.filter((item) => item.garbageDay.includes(day))
    }
  }

  distanceCalc(lat1, lat2, lon1, lon2) {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180 ) * Math.cos(lat2 * Math.PI / 180 ) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const d = R * c
    return d * 1000
  }

  async search({
    lat,
    lon,
    date,
    minm,
  }) {
    const day = date.getDay()
    const time = date.getHours() * 60 + date.getMinutes()
    const points = this.weekdata[day]
        .filter((item) => item.startTime > time + 1 && item.startTime < time + this.MAXTIME)
        .map((item) => {
          const distance = this.distanceCalc(lat, item.lat, lon, item.lon)
          const rank = (item.startTime - time) + distance * 2 * minm / this.MINM
          return {
            ...item,
            distance,
            rank,
          }
        })
        .filter((item) => item.distance < this.maxDistance)
        .filter((item) => (item.startTime - time - 1) > item.distance / this.MINM)

    points.sort((a, b) => {
      return a.rank - b.rank
    })

    return points
  }


  async findOne(date, pid) {
    const day = date.getDay()
    const time = date.getHours() + date.getMinutes()
    const point = this.alldata.find((item) => item.pid === pid)

    return {
      ...point,
      recycle: point.recycleDay.includes(day),
      time: point.startTime,
      countdownTime: point.startTime - time,
    }
  }
}

module.exports = TaiwanGarbage
