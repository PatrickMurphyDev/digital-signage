const mongoose = require('mongoose')
const widgetList = require('../../widgets/widget_list')
const Schema = mongoose.Schema

const DisabledWidget = new Schema({
  type: { type: String, enum: widgetList },
  data: { type: Schema.Types.Mixed },
})

module.exports = mongoose.model('DisabledWidget', DisabledWidget)
