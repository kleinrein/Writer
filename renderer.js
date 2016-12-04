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

const dbPref = new Datastore({
    filename: 'data/writerPref.db'
})

require('./lib/vendor/velocity.min.js')
require('./lib/vendor/velocity.ui.min.js')

$(function() {
    $(document).on('click', '#btn-back', (e) => {
        showContent('layout')
    })

    // Settings
    $(document).on('click', '#btn-settings', (e) => {
        $('#settings-wrapper').removeAttr("hidden")
        $('#settings-wrapper').fadeIn()
    })

    // Close settings
    $(document).on('click', '#btn-close-settings', (e) => {
        $('#settings-wrapper').attr('hidden')
        $('#settings-wrapper').fadeOut()
    })

    $(document).on('click', '#writer-wrapper', (e) => {
        const editor = document.querySelector('#editor')
            // if (editor != undefined) editor.focus()
    })

    // Delete document
    $(document).on('click', '.overview-delete', (e) => {
        console.log('delete')
        const doc = $(e.target).closest('.overview-doc')

        const id = $(e.target).closest('.overview').data('id')

        // Remove document view
        doc.addClass('overview-delete-anim')
        doc.fadeOut()

        // Update view (remove deleted doc)
        let undo = false

        // Make a undo button
        $('#writer-wrapper').append(`
            <div class="overview-undo-delete" data-id="${id}" hidden="hidden">
                <button>
                    <span>Undo</span>
                </button>
            </div>`)

        let undoBtn = $(`.overview-undo-delete[data-id='${id}']`)

        // Show undo button
        undoBtn.removeAttr('hidden')
        undoBtn.velocity({
            bottom: "0",
            opacity: 1
        }, {
            duration: 750,
            easing: "easeOutQuart",
            complete: _ => {
                console.log('complete')
            }
        })

        const removeUndoBtn = _ => {
            undoBtn.velocity({
                bottom: "-50px",
                opacity: 0
            }, {
                duration: 750,
                easing: "easeOutQuart",
                complete: _ => {
                    undoBtn.remove()
                }
            })
        }

        // Start timer
        let undoTimer = setTimeout(_ => {
            console.log('five sec has gone ')

            db.loadDatabase((err) => {
                db.remove({
                    _id: id
                }, {}, (err, numRemoved) => {
                    console.log('removed')
                    doc.remove()
                })
            })

            removeUndoBtn()
        }, 3000)

        // Click listener to button
        document.querySelector(`.overview-undo-delete[data-id='${id}'] button`).addEventListener('click', _ => {
            clearTimeout(undoTimer)
            console.log('clicked undo')
            doc.fadeIn()

            removeUndoBtn()
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

    // Update settings
    $(document).on('keyup change', '#settings-form :input', (e) => {
        const form = $(e.target).closest('form')
        const serializedForm = form.serializeArray().reduce((a, x) => {
            a[x.name] = x.value;
            return a;
        }, {});

        dbPref.loadDatabase((err) => {
            dbPref.remove({}, {
                multi: true
            }, function(err, numRemoved) {
                console.log(numRemoved)
                dbPref.insert(serializedForm, (err, newDoc) =>  {
                    updateSettingsView(newDoc)
                })
            });
        })
    })

    function updateSettingsView(newPref)  {
        
    }
})
