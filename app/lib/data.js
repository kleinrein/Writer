'use strict'
const Datastore = require('nedb')

class Data {
    constructor(filename) { 
        this.db = new Datastore({
            filename: filename
        })
    }

    remove(id, multi) {
        return new Promise((resolve, reject) => {
            if (multi === true) {
                this.db.loadDatabase((err) => {
                    this.db.remove({},  {
                        multi: true
                    }, (err, numRemoved) => {
                        if (err) reject(err)
                        resolve(numRemoved)
                    })
                })
            } else {
                this.db.loadDatabase((err) => {
                    this.db.remove({
                        _id: id
                    }, {}, (err, numRemoved) => {
                        if (err) reject(err)
                        resolve(numRemoved)
                    })
                })
            }
        })
    }

    find(id) {
        return new Promise((resolve, reject) => {
            if (id === undefined) {
                this.db.loadDatabase((err) => {
                    this.db.find({}, (err, docs) => {
                        if (err) reject(err)
                        resolve(docs)
                    })
                })
            } else {
                this.db.loadDatabase((err) => {
                    this.db.findOne({
                        _id: id
                    }, (err, doc) => {
                        if (err) reject(err)
                        resolve(doc)
                    })
                })
            }
        })
    }

    insert(doc) {
        return new Promise((resolve, reject) => {
            this.db.loadDatabase((err) => {
                this.db.insert(doc, function(err, newDoc) {
                    if (err) reject(err)
                    resolve(newDoc)
                })
            })
        })
    }

    update(id, parameter, update) {
        return new Promise((resolve, reject) => {
            this.db.loadDatabase((err) => {
                // TODO => Do this better
                if (parameter === 'content') {
                    this.db.update({
                        _id: id
                    }, {
                        $set: {
                            content: update
                        }
                    }, {}, (err, updatedDoc) => {
                        if (err) reject(err)
                        resolve(updatedDoc)
                    })
                } else if (parameter === 'filename') {
                    this.db.update({
                        _id: id
                    }, {
                        $set: {
                            filename: update
                        }
                    }, {}, (err, updatedDoc) => {
                        if (err) reject(err)
                        resolve(updatedDoc)
                    })
                }
            })
        })
    }
}

module.exports = function(opts) {
    return new Data(opts)
}
