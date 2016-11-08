const fs = require('fs')
const path = require('path')
const Pug = require('pug')

const View = function(viewName) {
    let templatePath = path.join(__dirname, "../views/", viewName + ".pug")
    let source = fs.readFileSync(templatePath, 'utf-8')
    let template = Pug.compile(source, {
        filename: path.join(__dirname, '../layout.pug'),
        pretty: true
    })

    this.toHtml = (data) => template(data)
}

module.exports = View
