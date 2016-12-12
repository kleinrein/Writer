const electron = require('electron')
const { app, ipcRenderer: ipc } = electron

module.exports = mainWindow => {
    const name = app.getName()
    const template = [{
        label: 'File',
        submenu: [{
            label: `About ${name}`,
            role: 'about'
        }, {
            type: 'separator'
        }, {
            label: 'Quit',
            accelerator: 'Ctrl+Q',
            click: _ => app.quit()

        }]
    }]

    return template
}
