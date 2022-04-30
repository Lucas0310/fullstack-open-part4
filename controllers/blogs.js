const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1, id: 1 })
    response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
    const { title, url, author, likes } = request.body
    if (!title) {
        return response.status(404).end()
    }

    if (!url) {
        return response.status(404).end()
    }

    const user = request.user

    const blog = new Blog({ title, url, author, likes, user: user.id })

    const newBlog = await blog.save()

    user.blogs = user.blogs.concat(newBlog._id)
    await user.save()

    response.status(201).json(newBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
    const user = request.user

    const blog = await Blog.findById(request.params.id)
    if (!blog) {
        return response.status(404).json({
            error: 'blog not found'
        })
    }

    const blogUserId = blog.user.toString()
    const requestUserId = user.id.toString()
    if (blogUserId === requestUserId) {
        await Blog.findByIdAndRemove(request.params.id)
        return response.status(204).end()
    }

    return response.status(404).json({
        error: 'cannot delete blogs created by other users'
    })

})

blogsRouter.put("/:id", async (request, response) => {
    const body = request.body
    const blog = {
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes
    }
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    response.status(200).json(updatedBlog)
})

module.exports = blogsRouter