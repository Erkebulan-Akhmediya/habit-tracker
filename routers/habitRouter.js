const { Router } = require('express')
const jwt = require('jsonwebtoken')

const User = require('../models/User')
const Habit = require('../models/Habit')

const habitRouter = Router()

function auth(req, res, next) {
    const token = req.headers['authorization']

    if (!token) { return }

    const decodedToken = jwt.verify(token, 'a98c8e234740b251e9a48fc6b50034c1')
    req.body.user = {
        id: decodedToken._id,
        username: decodedToken.username,
    }
    next()
}

async function addUserHabits(userId, habitId) {
    await User.findByIdAndUpdate(userId, { $push: { habits: habitId } })
}

function createProgressArray(number) {
    let arr = []

    for (let i = 0; i < number; i++) {
        arr.push(false)
    }

    return arr
}

function addDescription(description) {
    if (description === '' || description === null) {
        return 'no description'
    }
    return description
}

function changeProgress(progress, day) {
    if (day > progress.length) { 
        return progress
    }

    progress[day-1] = true
    return progress
}

habitRouter.get('/habits', auth, async (req, res) => {
    let habitIdArray = (await User.findById(req.body.user.id)).habits
    let habitArray = []
    for (let i = 0; i < habitIdArray.length; i++) {
        habitArray[i] = await Habit.findById(habitIdArray[i])
    }

    res.json({
        username: req.body.user.username,
        habits: habitArray,
    })
})

habitRouter.post('/create-habit', auth, async (req, res) => {
    await Habit.create({
        habit: req.body.habit, 
        description: addDescription(req.body.description),
        days: req.body.days,
        progress: createProgressArray(req.body.days),
    })
    const newHabit = await Habit.findOne({
        habit: req.body.habit, 
        description: addDescription(req.body.description),
        days: req.body.days,
    })
    addUserHabits(req.body.user.id, newHabit._id)
    res.send(JSON.stringify(newHabit))
})

habitRouter.post('/habit/:id', auth, async (req, res) => {
    res.json(await Habit.findById(req.params.id))
})

habitRouter.post('/change-progress/:id', auth, async (req, res) => {
    let progress = (await Habit.findById(req.params.id)).progress
    await Habit.findOneAndUpdate({ _id: req.params.id }, { progress: changeProgress(progress, req.body.day) })
    res.json(await Habit.findById(req.params.id))
})

habitRouter.post('/delete-habit/:id', auth, async (req, res) => {
    await User.findOneAndUpdate({ _id: req.body.user.id }, { $pull: { habits: req.params.id } })
    await Habit.deleteOne({ _id: req.params.id })
    res.json(await Habit.findOne()) 
})

module.exports = habitRouter