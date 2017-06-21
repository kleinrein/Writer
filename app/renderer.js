const constants = require('../constants')
const electron = require('electron')
const {
    app,
    ipcRenderer: ipc,
    remote
} = electron

const data = require('./lib/data.js')
const dbWriter = data(`${constants.DB_PATH}/Writer/writer.db`)
const dbPref = data(`${constants.DB_PATH}/Writer/writerPref.db`)

require('./lib/vendor/velocity.min.js')
require('./lib/vendor/velocity.ui.min.js')

// Globals
let preferences
const darkThemes = ['aurora', 'evening', 'kaleidoscope', 'psychedelic', 'space', 'windenergy']
const lightThemes = ['lake', 'rainstorm', 'sea', 'waves', 'winter']

// Settings
$(function() {
    const checkBgs = newPref => {
        if (newPref !== undefined) {
            const dark = darkThemes.includes(newPref.theme) || newPref.darkmode
            const light = lightThemes.includes(newPref.theme)

            const bgChecks = document.querySelectorAll('.bg-check')

            for (i = 0; i < bgChecks.length; ++i) {
                bgChecks[i].classList.remove(dark ? 'light' : 'dark')
                bgChecks[i].classList.add(dark ? 'dark' : 'light')
            }

            if(dark) { $('body').addClass('darkmode') } else { $('body').removeClass('darkmode') }
        }
    }

    const saveFile = _ => {
        const $dialog = $('#btn-save-file-dialog')

        // Add overlay
        $('#writer-wrapper').append('<div id="btn-save-file-overlay"></div>')
        $('#btn-save-file-overlay').velocity({
            opacity: 1
        })

        $dialog.css('display', 'block')
        $dialog.velocity({
            translateY: '-50px',
            opacity: 1
        })

        $('#btn-save-file-overlay').on('click', _ => {
            // Animate save dialog
            $dialog.velocity({
                translateY: '0px',
                opacity: 0
            }, {
                complete: _ => {
                    $dialog.css('display', 'none')
                }
            })

            // Remove overlay
            $('#btn-save-file-overlay').velocity({
                opacity: 0,
            }, {
                complete: _ => {
                    $('#btn-save-file-overlay').remove()
                }
            })
        })
    }

    // Back to overview
    $(document).on('click', '#btn-back', (e) => {
        showContent('layout')
    })

    // Full screen
    $(document).on('click', '#btn-full-screen', (e) => {
        ipc.send('full-screen')
    })

    $(document).on('click', '#btn-save-file', _ => {
        saveFile()
    })

    // Save file as txt
    $(document).on('click', '#btn-save-file-txt', _ => {
        ipc.send('save-file-as-txt', $('#editor').text())
    })

    // Settings
    $(document).on('click', '#btn-settings', (e) => {
        const pug = require('pug')
        const compiledFunction = pug.compileFile('app/views/settings.pug')
        $('#writer-wrapper').append(compiledFunction(preferences))

        // Iterate and show fonts select
        $('#settings-wrapper select option').each(function(index) {
            $(this).css('font-family', $(this).text())
        })
        $('#settings-wrapper select').css('font-family', $('#settings-wrapper select').text())

        $('#settings-wrapper').velocity('transition.slideDownIn', {
            duration: 300
        })
    })

    // Close settings
    $(document).on('click', '#btn-close-settings', (e) => {
        $('#settings-wrapper').velocity('transition.slideUpOut', {
            duration: 300,
            complete: _ => $('#settings-wrapper').remove()
        })
    })

    // Font size changed
    $(document).on('change input', '#setting-font-size', (e) => {
        const $fontSizeText = $('#setting-font-size-text')
        const fontSize = $(e.target).val()
    })

    // Delete document
    $(document).on('click', '.overview-delete', (e) => {
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
            dbWriter.remove(id)
                .then(doc.remove())

            removeUndoBtn()
        }, 2000)

        // Click listener to button
        document.querySelector(`.overview-undo-delete[data-id='${id}'] button`).addEventListener('click', _ => {
            clearTimeout(undoTimer)
            doc.fadeIn()

            removeUndoBtn()
        })
    })

    // Show on mouse move
    $(document).on("mousemove", (e) => {
        if ($('#bottombar').css('opacity') == 0) {
            $('#bottombar, #topbar').velocity({
                opacity: 1
            }, {
                duration: 500,
                easing: 'easeOutQuint'
            })
        }
    })

    // Change content
    $(document).on('input propertychange paste', '#editor', (e) => {
        // Focus mode on
        if ($('#bottombar').css('opacity') == 1) {
            $('#topbar, #bottombar').velocity({
                opacity: 0
            }, {
                duration: 500
            })
        }

        // Content is changed
        // Save changes
        const id = $(e.target).data('id')
        const content = $(e.target).val()

        dbWriter.update(id, 'content', content)
            .catch(err => console.error(err))
    })

    // Change filename
    $(document).on('input propertychange paste', '#filename', (e) => {
        const filename = $(e.target).text()
        const id = $('#editor').data('id')

        dbWriter.update(id, 'filename', filename)
            .catch(err => console.error(err))
    })

    const showEditor = (doc, id) => {
        if (id === undefined) {
            id = doc._id
        }
        const editor = document.querySelector('#editor')

        const pug = require('pug')
        const compiledFunction = pug.compileFile('app/views/editor.pug')

        $('body').css('overflow', 'hidden')
        $('#writer-wrapper').velocity({
            opacity: 0
        }, {
            duration: 250,
            complete: function() {
                dbPref.find()
                    .then(docs => {
                        preferences = docs[0]
                        console.log(preferences)
                        $('#writer-wrapper').html(compiledFunction(preferences))

                        $('#editor').html(doc.content)
                        $('#filename').html(doc.filename)

                        // TODO => Store the id somewhere else?
                        $('#editor').attr('data-id', id)

                        // Show
                        checkBgs(preferences)
                        $('#writer-wrapper').css('transform', 'none')
                        $('#writer-wrapper').velocity({
                            opacity: 1
                        }, {
                            duration: 200
                        })
                    })
                .catch(err => console.error(err))
            }
        })


    }

    // New document
    $(document).on('click', '.overview-new-file', (e) => {
        let id = $(e.target).data('id')
            // TODO => Fix this properly, so click on span binds to parent
        if (id === undefined)
            id = $(e.target).parent().data('id')

        // New document
        let emptyDoc = {
            content: "",
            filename: "untitled",
            toDelete: false
        }
        dbWriter.insert(emptyDoc)
            .then(newDoc => showEditor(newDoc, id))
            .catch(err => console.error(err))
    })

    $(document).on('click', '.overview', (e) => {
        // Close if user clicked delete button
        if ($(e.target).hasClass('overview-delete') ||
            $(e.target).hasClass('ion-ios-close-empty')) return

        let id = $(e.target).data('id')
            // TODO => Fix this properly, so click on span binds to parent
        if (id === undefined)
            id = $(e.target).parent().data('id')

        // Existing document
        dbWriter.find(id)
            .then(doc => {
                if (doc != null)
                    showEditor(doc, id)
            })
            .catch(err => console.error(err))
    })

    // Update settings
    $(document).on('keyup change', '#settings-form :input', (e) => {
        const form = $(e.target).closest('form')
        const serializedForm = form.serializeArray().reduce((a, x) => {
            a[x.name] = x.value;
            return a;
        }, {});

        dbPref.remove(0, true)
            .then(numRemoved => {
                dbPref.insert(serializedForm)
                    .then(newSettings => {
                        preferences = newSettings
                        updateSettingsView(newSettings)
                    })
                    .catch(err => console.error(err))
            })
            .catch(err => console.error(err))
    })

    function updateSettingsView(newPref)  {
        // Darkmode
        newPref.darkmode ? $('body').addClass('darkmode') : $('body').removeClass('darkmode')

        const editor = document.querySelector('#editor')

        // Font family
        editor.style.fontFamily = `${newPref.fontfamily}`

        // Font size
        editor.style.fontSize = `${newPref.fontsize}px`

        // Theme
        if (newPref.theme === 'default') {
            $('.video-wrapper').remove()
            $('.image-bg').remove()
        } else {
            $('.video-wrapper').remove()
            $('.image-bg').remove()
            if (newPref.usevideo) {
                $('#writer-wrapper').append(`
                        <div class="video-wrapper">
                            <video preload="metadata" loop="" autoplay="" muted="" class="video">
                                <source src="app/video/${newPref.theme}.mp4" type="video/mp4"/>
                            </video>
                            <div class="video-overlay"></div>
                        </div>
                    `)

            } else {
                $('#writer-wrapper').append(`<div class="image-bg" style="background-image: url(app/images/${newPref.theme}.jpg)"></div>`)
            }
        }

        // Light/dark text
        checkBgs(newPref)
    }
})
