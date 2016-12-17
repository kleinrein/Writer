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

// Globals
let preferences
const darkThemes = ['aurora', 'evening', 'kaleidoscope', 'psychedelic', 'space', 'windenergy']
const lightThemes = ['lake', 'rainstorm', 'sea', 'waves', 'winter']

// Settings
document.addEventListener('DOMContentLoaded', (event) => {

    const checkBgs = newPref => {
        if (newPref !== undefined) {
            const dark = darkThemes.includes(newPref.theme)
            const light = lightThemes.includes(newPref.theme)

            const bgChecks = document.querySelectorAll('.bg-check')

            for (i = 0; i < bgChecks.length; ++i) {
                bgChecks[i].classList.remove(dark ? 'light' : 'dark')
                bgChecks[i].classList.add(dark ? 'dark' : 'light')
            }
        }
    }

    const saveFile = _ => {
        const dialog = document.getElementById('btn-save-file-dialog')
            // Add overlay
        document.getElementById('writer-wrapper').insertAdjacentHTML('beforeend', '<div id="btn-save-file-overlay"></div>')

        document.getElementById('btn-save-file-overlay').addEventListener('click', _ => {
            // Remove on click
            document.getElementById('btn-save-file-overlay').remove()

            // Animate save dialog
            Velocity(dialog, {
                translateY: '0px',
                opacity: 0,
                complete: _ => {
                    dialog.style.display = 'none'
                }
            })
        })

        dialog.style.display = 'block'
        Velocity(dialog, {
            translateY: '-50px',
            opacity: 1
        })
    }

    const openSettings = _ => {
        const pug = require('pug')
        const compiledFunction = pug.compileFile('views/settings.pug')
        document.getElementById('writer-wrapper').insertAdjacentHTML('beforeend', compiledFunction(preferences))

        // Iterate and show fonts select
        document.querySelectorAll('#settings-wrapper select option')
            .forEach(option => option.style.fontFamily = option.innerText())

        document.querySelector('#settings-wrapper select').style.fontFamily =
            document.querySelector('#settings-wrapper select').innerText()

        Velocity(document.getElementById('settings-wrapper'), ('transition.slideDownIn'), {
            duration: 300
        })
    }

    // Click events
    document.addEventListener("click", (e) => {
        const target = e.target;

        console.log(target)

        if (target.id == 'btn-back') {
            showContent('layout')
        }

        if (target.id == 'btn-full-screen') {
            ipc.send('full-screen')
        }

        if (target.id == 'btn-save-file') {
            saveFile()
        }

        if (target.id == 'btn-save-file-txt') {
            ipc.send('save-file-as-txt', document.getElementById('editor').innerText())
        }

        if (target.id == 'btn-settings') {
            openSettings()
        }

        if (target.id == 'btn-close-settings') {
            Velocity(document.getElementById('settings-wrapper'), 'transition.slideUpOut', {
                duration: 300,
                complete: _ => document.getElementById('settings-wrapper').remove()
            })
        }


        if (target.classList.contains('overview-delete')) {
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
                easing: "easeOutQuart"
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
                db.loadDatabase((err) => {
                    db.remove({
                        _id: id
                    }, {}, (err, numRemoved) => {
                        doc.remove()
                    })
                })

                removeUndoBtn()
            }, 3000)

            // Click listener to button
            document.querySelector(`.overview-undo-delete[data-id='${id}'] button`).addEventListener('click', _ => {
                clearTimeout(undoTimer)
                doc.fadeIn()

                removeUndoBtn()
            })
        }

        if (target.classList.contains('overview-new-file')) {
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
                db.insert(emptyDoc, function (err, newDoc) {
                    if (err === null) showEditor(newDoc, id)
                });
            })
        }

        if (target.classList.contains('overview')) {
            // Close if user clicked delete button
            if ($(e.target).classList.contains('overview-delete') ||
                $(e.target).classList.contains('ion-ios-close-empty')) return

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
                            showEditor(doc, id)
                        }
                })
            })
        }


        if (target.classList.contains('target')) {
            // do stuff
            console.log(e.target);
        }
    });

    document.addEventListener('change', (e) => {
        // Setting font size
        if (e.target.id == 'setting-font-size') {
            document.getElementById('setting-font-size-text').position(e.target).position()
        }

        // Editor
        if (e.target.id == 'editor') {
            // Focus mode on
            $('#topbar, #bottombar').velocity({
                opacity: 0
            }, {
                duration: 500
            })

            // Content is changed
            // Save changes
            const id = $(e.target).data('id')
            const content = $(e.target).val()

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
        }

        // Filename
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

    document.addEventListener('mouseover', (e) => {
        if ($('#bottombar').css('opacity') == 0) {
            $('#bottombar, #topbar').velocity({
                opacity: 1
            }, {
                duration: 500,
                easing: 'easeOutQuint'
            })
        }
    })

    const showEditor = (doc, id) => {
        if (id === undefined) {
            id = doc._id
        }
        const editor = document.querySelector('#editor')

        const pug = require('pug')
        const compiledFunction = pug.compileFile('views/editor.pug')
        const writerWrapper = document.getElementById('writer-wrapper')

        document.querySelector('body').style.overflow = 'hidden'
        Velocity(writerWrapper, {
            opacity: 0
        }, {
            duration: 250,
            complete: function () {
                dbPref.loadDatabase((err) => {
                    dbPref.find({}, (err, docs) => {
                        preferences = docs[docs.length - 1]
                        writerWrapper.innerHTML = compiledFunction(preferences())

                        document.getElementById('editor').innerHTML = doc.content
                        document.getElementById('filename').innerHTML = doc.filename

                        // TODO => Store the id somewhere else?
                        document.getElementById('editor').setAttribute('data-id', id)

                        // Show
                        checkBgs(preferences)

                        writerWrapper.syle.transform = 'none'
                        Velocity(writerWrapper, {
                            opacity: 1
                        }, {
                            duration: 200
                        })
                    })
                })
            }
        })
    }

    // Update settings
    /*
    $(document).on('keyup change', '#settings-form :input', (e) => {
        const form = $(e.target).closest('form')
        const serializedForm = form.serializeArray().reduce((a, x) => {
            a[x.name] = x.value;
            return a;
        }, {});

        dbPref.loadDatabase((err) => {
            dbPref.remove({}, {
                multi: true
            }, function (err, numRemoved) {
                dbPref.insert(serializedForm, (err, newDoc) =>  {
                    updateSettingsView(newDoc)
                })
            });
        })
    })
    */

    function updateSettingsView(newPref)  {
        // Darkmode
        newPref.darkmode ? document.querySelector('body').classList.add('darkmode') : document.querySelector('body').classList.remove('darkmode')

        // Editor
        const editor = document.querySelector('#editor')

        // Font family
        editor.style.fontFamily = `${newPref.fontfamily}`

        // Font size
        editor.style.fontSize = `${newPref.fontsize}px`

        // Remove old theme
        document.querySelectorAll('.image-bg').forEach((el) => el.remove())
        document.querySelectorAll('.video-wrapper').forEach((el) => el.remove())

        // Theme
        if (newPref.theme !== 'default') {
            if (newPref.usevideo) {
                document.querySelector('#writer-wrapper')
                    .insertAdjacentHTML('beforeend', `
                        <div class="video-wrapper">
                            <video preload="metadata" loop="" autoplay="" muted="" class="video">
                                <source src="video/${newPref.theme}.mp4" type="video/mp4"/>
                            </video>
                            <div class="video-overlay"></div>
                        </div>`)
            } else {
                document.querySelector('#writer-wrapper')
                    .insertAdjacentHTML('beforeend', `<div class="image-bg" style="background-image: url(images/${newPref.theme}.jpg)"></div>`)
            }
        }

        // Light/dark text
        checkBgs(newPref)
    }
})
