const electron = require('electron')
const { app, ipcRenderer: ipc, dialog } = electron

module.exports = mainWindow => {
    const name = app.getName()
    let template

    // Normal template
    // Win && Linux
    if (process.platform == 'darwin') {
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
            }
        ]   
    }

    template.push(
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
            },
            {
                label: 'Edit',
                submenu: [
                    {
                        label: 'Undo',
                        role: 'undo'
                    }, {
                        label: 'Redo',
                        role: 'redo'
                    }, {
                        type: 'separator'
                    }, {
                        label: 'Cut',
                        role: 'cut'
                    }, {
                        label: 'Copy',
                        role: 'copy'
                    }, {
                        label: 'Paste',
                        role: 'paste'
                    }
                ]
            }
    )

    return template
}
