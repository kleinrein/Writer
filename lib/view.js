const fs = require('fs')
const path = require('path')
const Pug = require('pug')

const View = function(viewName) {
    const templatePath = path.join(__dirname, "../views/", viewName + ".pug")
    const source = fs.readFileSync(templatePath, 'utf-8')

    const template = Pug.compile(source, {
        filename: path.join(__dirname, '../layout.pug'),
        pretty: true
    })

    this.toHtml = (data) => template(data)
}

module.exports = View
