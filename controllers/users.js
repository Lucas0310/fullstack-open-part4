const usersRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')

usersRouter.get('/', async (request, response) => {
    const users = await User.find({}).populate('blogs')
    response.json(users)
})

usersRouter.post('/', async (request, response) => {
    const { username, name, password } = request.body

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    if (!name || name.length < 3) {
        return response.status(400).json({
            error: 'The name field must be equals or greater than 3'
        })
    }

    if (!username || username.length < 3) {
        return response.status(400).json({
            error: 'The username field must be equals or greater than 3'
        })
    }

    if (!password || password.length < 3) {
        return response.status(400).json({
            error: 'The password field must be equals or greater than 3'
        })
    }

    const user = new User({
        name: name,
        username: username,
        passwordHash: passwordHash
    })

    const newUser = await user.save()
    response.status(201).json(newUser)
})

module.exports = usersRouter