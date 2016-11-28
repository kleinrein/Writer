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
    $(document).on('click', '#btn-back', (e) => {
        showContent('layout')
    })

    $(document).on('click', '#writer-wrapper', (e) => {
        const editor = document.querySelector('#editor')
        // if (editor != undefined) editor.focus()
    })

    $(document).on('blur', '#filename', (e) => {
        console.log('change')

        const filename = $(e.target).text()
        const id = $('#editor').data('id')

        db.loadDatabase((err) => {
            db.update({
                _id: id
            }, {
                $set: {
                    filename: filename
                }
            }, {}, function() {
                console.log('updated')
            });
        })
    })

    $(document).on('click', '.overview', (e) => {
        let id = $(e.target).data('id')
            // TODO => Fix this properly, so click on span binds to parent
        if (id === undefined)
            id = $(e.target).parent().data('id')

        console.log(id)

        if ($(e.target).hasClass('overview-new-file')) {
            // New document
            db.loadDatabase((err) => {
                let emptyDoc = { content: "", filename: "untitled" }
                db.insert(emptyDoc, function (err, newDoc) {
                    if (err === null)
                        showContent('editor')
                        $('#editor').html(newDoc.content)
                        $('#filename').html(newDoc.filename)

                        $('#editor').attr('data-id', id)
                });
            })
        } else {
            // Existing document
            db.loadDatabase((err) => {
                db.findOne({
                    _id: id
                }, (err, doc) => {
                    console.log(doc)
                    if (err === null)
                        if (doc != null) {
                            showContent('editor')
                            $('#editor').html(doc.content)
                            $('#filename').html(doc.filename)

                            // TODO => Store the id somewhere else?
                            $('#editor').attr('data-id', id)
                        }
                })
            })
        }
    })
})
