const { Schema, model } = require('mongoose')

const habitSchema = new Schema({
    habit: String, 
    description: String,
    days: Number,
    progress: [Boolean],
})

module.exports = model('Habit', habitSchema)