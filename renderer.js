const electron = require('electron')
const { app, ipcRenderer: ipc, remote } = electron

$(function() {

    $(document).on('click', '#btn-save', _ => {
        const content = $('.editor').text()
        console.log(content)
        ipc.send('save-file', content)
    })

    $(document).on('click', '#btn-open', _ => {
        ipc.send('open-file')
    })

    $(document).on('click', '#writer-wrapper', (e) => {

    })
})
