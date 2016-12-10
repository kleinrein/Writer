const electron = require('electron')
const { app } = electron

module.exports = mainWindow => {
    const name = app.getName()
    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: `About ${name}`,
                    role: 'about'
                },{
                    type: 'separator'
                },
                {
                    label: 'Quit',
                    accelerator:'Cmd+Q',
                    click: _ => { app.quit() }
                }
            ]
        }
    ]

    return template
}
