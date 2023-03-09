const { Schema, model } = require('mongoose')

const userSchema = new Schema({
    username: String, 
    password: String,
    habits: [String],
})

module.exports = model('User', userSchema)