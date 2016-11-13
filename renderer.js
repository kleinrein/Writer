const electron = require('electron')
const { app, ipcRenderer: ipc, remote } = electron

$(function() {

    $(document).on('click', 'button', _ => {
        ipc.send('save-file', 'testfile')
    })
})
