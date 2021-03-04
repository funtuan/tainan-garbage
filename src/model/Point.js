const mongoose = require('mongoose');
require('mongoose-double')(mongoose);

const {Schema} = mongoose;

const schema = new Schema({
  pid: {
    type: String,
    index: true,
  },
  name: {
    type: String,
  },
  addr: {
    type: String,
  },
  area: {
    type: String,
  },
  lat: {
    type: Schema.Types.Double,
  },
  lon: {
    type: Schema.Types.Double,
  },
  schedule: {
    mon: {
      open: Boolean,
      time: Number,
      recycle: Boolean,
    },
    tue: {
      open: Boolean,
      time: Number,
      recycle: Boolean,
    },
    wed: {
      open: Boolean,
      time: Number,
      recycle: Boolean,
    },
    thu: {
      open: Boolean,
      time: Number,
      recycle: Boolean,
    },
    fri: {
      open: Boolean,
      time: Number,
      recycle: Boolean,
    },
    sat: {
      open: Boolean,
      time: Number,
      recycle: Boolean,
    },
    sun: {
      open: Boolean,
      time: Number,
      recycle: Boolean,
    },
  },
  ref: {
    type: String,
    default: '未知',
  },
}, {
  timestamps: true,
});


const model = mongoose.model('point', schema);

module.exports = model;
