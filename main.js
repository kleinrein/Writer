const electron = require('electron')
const { app, BrowserWindow, ipcMain:ipc, Menu } = electron

require('electron-reload')(__dirname)

app.on('ready', _ => {
    mainWindow = new BrowserWindow({width:800, height:600, minWidth:500, minHeight:250, title: 'Writer'})
    mainWindow.loadURL(`file://${__dirname}/index.html`)
    mainWindow.webContents.openDevTools()

    mainWindow.on('closed', _ => {
        mainWindow = null
    })
})

app.on('window-all-closed', _ => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', _ => {
    if (mainWindow === null) {
        createWindow()
    }
})
