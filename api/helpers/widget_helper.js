const Display = require('../models/Display')
const DisabledWidget = require('../models/DisabledWidget')
const CommonHelper = require('./common_helper')

function addWidget(req, res) {
  let widget = req.crudify.result
  if(widget.data.url){
    widget.data.url = widget.data.url.replaceAll('\\','/') // todo solve path issue
  }
  return Display.findById(widget.display)
    .then(display => {
      if (!display) return res.status(404).json({ error: 'Display not found' })
      display.widgets.push(widget._id)
      return display.save().then(display => {
        if (!display) return res.status(500).json({ error: 'Display not saved' })
        return res.json({ success: true })
      })
    })
    .catch(err => process.stdout.write(JSON.stringify(err)))
} 

function deleteWidget(req, res) {
  let widget = req.crudify.result
  //let disabledWidget = new DisabledWidget({type: widget.type, data: widget.data})
  return Display.findById(widget.display).then(display => {
    if (!display) return res.status(404).json({ error: 'Display not found' })
    display.widgets = display.widgets.filter(function(value) {
      return !widget._id.equals(value)
    })
    //return disabledWidget.save().then(v2=>{
      return display
        .save()
        .then(() => CommonHelper.broadcastUpdate(res.io))
        .then(() => {
          return res.json({ success: true })
        })
      })
    //})
}

module.exports = {
  deleteWidget,
  addWidget
}
