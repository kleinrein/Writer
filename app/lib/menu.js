const electron = require('electron')
const { app, ipcRenderer: ipc, dialog } = electron

module.exports = mainWindow => {
    const name = app.getName()
    let template

    // Normal template
    // Win && Linux
    if (process.platform != 'darwin') {
        template = [
            {
                label: 'File',
                submenu: [
                    {
                        label: `About ${name}`,
                        role: 'about'
                    }, {
                        label: 'Import file',
                        accelerator: 'Ctrl+I',
                        click: _ => ipc.send('import-file')
                    }, {
                        type: 'separator'
                    }, {
                        label: 'Quit',
                        accelerator: 'Ctrl+Q',
                        click: _ => app.quit()
                    }
                ]
            }
        ]
    } else {
        // MacOS
        template = [
            {
                label: name,
                submenu: [
                    {
                        label: `About ${name}`,
                        role: 'about'
                    }, {
                        type: 'separator'
                    }, {
                        label: 'Quit',
                        accelerator: 'Cmd+Q',
                        click: _ => app.quit()
                    }
                ]
            }, {
                label: 'File',
                submenu: [
                    {
                        label: `Import file`,
                        accelerator: 'Cmd+I',
                        click: _ => {
                            dialog.showOpenDialog({
                                options: {
                                    title: 'Test'
                                }
                            })
                        }
                    }
                ]
            }
        ]
    }

    return template
}
