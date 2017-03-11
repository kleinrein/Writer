module.exports = Object.freeze({
    DB_PATH: process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/Documents")
})
