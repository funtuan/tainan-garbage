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
    sparse: true,
  },
  lon: {
    type: Schema.Types.Double,
    sparse: true,
  },
  schedule: {
    mon: {
      open: {type: Boolean, sparse: true},
      time: Number,
      recycle: Boolean,
    },
    tue: {
      open: {type: Boolean, sparse: true},
      time: Number,
      recycle: Boolean,
    },
    wed: {
      open: {type: Boolean, sparse: true},
      time: Number,
      recycle: Boolean,
    },
    thu: {
      open: {type: Boolean, sparse: true},
      time: Number,
      recycle: Boolean,
    },
    fri: {
      open: {type: Boolean, sparse: true},
      time: Number,
      recycle: Boolean,
    },
    sat: {
      open: {type: Boolean, sparse: true},
      time: Number,
      recycle: Boolean,
    },
    sun: {
      open: {type: Boolean, sparse: true},
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
