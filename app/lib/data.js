'use strict'
const Datastore = require('nedb')

class Data {
    constructor(filename) {
        this.db = new Datastore({
            filename: 'data/writer'
        })
    }

    remove(id) {
        return new Promise((resolve, reject) => {
            this.db.loadDatabase((err) => {
                this.db.remove({
                    _id: id
                }, {}, (err, numRemoved) => {
                    if (err) reject(err)
                    resolve(numRemoved)
                })
            })
        })
    }

    add() {

    }

    update(id, parameter) {
        return new Promise((resolve, reject) => {
            this.db.loadDatabase((err) => {
                this.db.remove({
                    _id: id
                }, {
                    $set: {
                        parameter: parameter
                    }
                }, (err, updatedDoc) => {
                    if (err) reject(err)
                    resolve(updatedDoc)
                })
            })
        })
    }
}

module.exports = function(opts) {
    return new Data(opts)
}
