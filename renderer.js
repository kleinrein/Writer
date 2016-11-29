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

    // Delete document
    $(document).on('click', '.overview-delete', (e) => {
        console.log('delete')

        const id = $(e.target).closest('.overview').data('id')

        db.loadDatabase((err) => {
            // Set toDelete flag to true
            db.update({
                _id: id
            }, {
                $set: {
                    toDelete: true
                }
            }, {}, _ => {
                console.log('toDelete flag set')
                // Update view (remove deleted doc)

                // Start timer
                setTimeout( _ => {
                    
                }, 5000)
            })
        })
    })

    // Change content
    $(document).on('input propertychange paste', '#editor', (e) => {
        // Content is changed
        // Save changes
        const id = $(e.target).data('id')
        const content = $(e.target).text()

        db.loadDatabase((err) => {
            db.update({
                _id: id
            }, {
                $set: {
                    content: content
                }
            }, {}, _ => {
                console.log('content updated :)')
            })
        })
    })

    // Change filename
    $(document).on('input propertychange paste', '#filename', (e) => {
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
            }, {}, _ => {
                console.log('updated')
            });
        })
    })

    // New document
    $(document).on('click', '.overview-new-file', (e) => {
        let id = $(e.target).data('id')
            // TODO => Fix this properly, so click on span binds to parent
        if (id === undefined)
            id = $(e.target).parent().data('id')

        // New document
        db.loadDatabase((err) => {
            let emptyDoc = {
                content: "",
                filename: "untitled",
                toDelete: false
            }
            db.insert(emptyDoc, function(err, newDoc) {
                if (err === null)
                    showContent('editor')
                $('#editor').html(newDoc.content)
                $('#filename').html(newDoc.filename)

                $('#editor').attr('data-id', id)
            });
        })
    })

    $(document).on('click', '.overview', (e) => {
        // Close if user clicked delete button
        const isDelete = $(e.target).hasClass('overview-delete') ||
            $(e.target).hasClass('ion-ios-close-empty')
        if (isDelete) return

        let id = $(e.target).data('id')
            // TODO => Fix this properly, so click on span binds to parent
        if (id === undefined)
            id = $(e.target).parent().data('id')

        // Existing document
        db.loadDatabase((err) => {
            db.findOne({
                _id: id
            }, (err, doc) => {
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
    })
})
