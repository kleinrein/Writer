const electron = require('electron')
const { app, ipcRenderer: ipc, remote } = electron

$(function() {

    $(document).on('click', 'button', _ => {
        const content = $('.editor').text()
        console.log(content)
        ipc.send('save-file', content)
    })

    $(document).on('click', '#writer-wrapper', (e) => {

    })
})
