const electron = require('electron')
const fs = require('fs')
const {
    app,
    BrowserWindow,
    ipcMain: ipc,
    Menu,
    dialog
} = electron
const menuTemplate = require('./lib/menu')

const Datastore = require('nedb')
const db = new Datastore({ filename: 'data/writer.db', autoload: true })
const dbPref = new Datastore({ filename: 'data/writerPref.db', autoload: true })

// Insert db testing

// Insert pref if null
/*
dbPref.loadDatabase((err) => {
    dbPref.find({}, (err, docs) => {
        if (docs.length === 0) {
            const prefDoc = {
                darkmode : false
            }

            dbPref.insert(prefDoc, (err, newDoc) =>  {

            })
        }
    })
})
*/
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

    const menuContents = Menu.buildFromTemplate(menuTemplate(mainWindow))
    Menu.setApplicationMenu(menuContents)
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

ipc.on('full-screen', (evt) => {
    mainWindow.setFullScreen(mainWindow.isFullScreen() ? false : true)
})
