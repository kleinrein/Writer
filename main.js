const electron = require('electron')
const fs = require('fs')
const {
    app,
    BrowserWindow,
    ipcMain: ipc,
    Menu,
    dialog
} = electron

const Datastore = require('nedb')
const db = new Datastore({ filename: 'data/writer.db', autoload: true })

// Insert db testing

/*
var doc = { content: "Test 123.. :-)", filename: "Testnavn" }

db.insert(doc, function (err, newDoc) {   // Callback is optional
  // newDoc is the newly inserted document, including its _id
  // newDoc has no key called notToBeSaved since its value was undefined
});
*/


const client = require('electron-connect').client

app.on('ready', _ => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 500,
        minHeight: 400,
        title: 'Writer'
    })
    mainWindow.loadURL(`file://${__dirname}/index.html`)
    mainWindow.webContents.openDevTools()

    mainWindow.on('closed', _ => {
        mainWindow = null
    })

    client.create(mainWindow)
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

// Save file
ipc.on('save-file', (evt, content) => {
    console.log('save file with content: ' + content)
    dialog.showSaveDialog({
        title: 'Save file',
        filters: [{
            name: 'text',
            extensions: ['txt']
        }]
    }, (filename) => {
        console.log(filename)
        console.log(content)
        if (filename !== undefined)
            fs.writeFile(filename, content, (err) => {
                if (err) console.log(err)
                console.log(`It's saved`)
            })
    })
})

// Open file
ipc.on('open-file', (evt, content) => {
    dialog.showOpenDialog({
        title: 'Open file',
        filters: [{
            name: 'text',
            extensions: ['txt']
        }],
        properties: ['openFile']
    }, (filepath) => {
        if (filepath !== undefined)
            console.log(filepath)
            fs.readFile(filepath[0], 'utf8', (err, data) => {
                if (err) console.log(err)
                console.log(data.toString())
            })
    })
})


ipc.on('new-file', (evt) => {

})
