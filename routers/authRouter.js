const { Router } = require('express')
const jwt = require('jsonwebtoken')

const User = require('../models/User')

const authRouter = Router()

authRouter.post('/sign-up', async (req, res) => {
    const existingUsers = await User.find({ username: req.body.username })
    if (existingUsers.length > 0) {
        res.json({ token: "" })
        return
    }

    const newUser = await User.create({
        username: req.body.username,
        password: req.body.password,
    })
    
    const token = jwt.sign(newUser.toObject(), 'a98c8e234740b251e9a48fc6b50034c1')
    res.json({ token: token })
})

authRouter.post('/sign-in', async (req, res) => {
    const foundUser = await User.findOne({
        username: req.body.username,
        password: req.body.password,
    })

    if (!foundUser) {
        res.json({ token: "" })
        return
    }

    const token = jwt.sign(foundUser.toObject(), 'a98c8e234740b251e9a48fc6b50034c1')

    res.json({ token: token })
})

module.exports = authRouter