const electron = require('electron')
const {
    app,
    ipcRenderer: ipc,
    remote
} = electron

const Datastore = require('nedb')
const db = new Datastore({
    filename: 'data/writer.db'
})

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
        const editor = document.querySelector('.editor')
        if (editor != undefined) editor.focus()
    })

    $(document).on('click', '.overview', (e) => {
        const id = $(e.target).data('id')
        console.log(id)
        showContent('editor')

        if ($(e.target).hasClass('overview-new-file')) {
            // New document

        } else {
            // Existing document
            db.loadDatabase((err) => { // Callback is optional
                db.findOne({
                    _id: id
                }, (err, doc) => {
                    $('.editor').html(doc.content)
                });
            });

        }
    })
})
