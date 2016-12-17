const Emitter = require('events').EventEmitter
const util = require('util')
const path = require('path')
const fs = require('fs')
const View = require('./view')

const App = function () {
    this.on("view-selected", function(viewName) {
        let view = new View(viewName)
        this.emit('rendered', view.toHtml())
    })
}

util.inherits(App, Emitter)
module.exports = new App()
