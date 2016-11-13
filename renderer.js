const electron = require('electron')
const { app, ipcRenderer: ipc, remote, dialog } = electron

$(function() {

    $('button').click(function(e) {
        ipc.send('save-file', 'testfile')
    })
})
