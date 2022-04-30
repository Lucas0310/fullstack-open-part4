const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/User')

const api = supertest(app)
let token = null

beforeEach(async () => {
    await Blog.deleteMany({})
    await User.deleteMany({})
    await api.post('/api/users').send({ username: 'test', password: 'test', name: 'test' })

    const response = await api.post('/api/login').send({ username: 'test', password: 'test' });
    token = `Bearer ${response.body.token}`
})

test('blogs are returned as json', async () => {
    await api.get('/api/blogs')
        .set('Authorization', token)
        .expect(200)
        .expect('Content-Type', /application\/json/)
})

test('check the id poperty is in fact named id', async () => {
    const blog = new Blog({ title: 'A new blog', author: 'Unknown author', url: 'this is an url', likes: 3 })
    await blog.save()

    const blogs = await Blog.find({})

    expect(blogs[0].id).toBeDefined()
})

test('check if a blog is created succesfully', async () => {
    const blog = { title: 'A new blog', author: 'Unknown author', url: 'this is an url', likes: 3 }
    await api.post('/api/blogs')
        .set('Authorization', token)
        .send(blog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs').set('Authorization', token)
    const titles = response.body.map(r => r.title)

    expect(response.body).toHaveLength(1)
    expect(titles).toContain('A new blog')
})

test('if likes property is missing it defaults to 0', async () => {
    const blog = { title: 'A new blog', author: 'Unknown author', url: 'this is an url' }

    await api.post('/api/blogs')
        .set('Authorization', token)
        .send(blog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const createdBlogs = await api.get('/api/blogs/').set('Authorization', token)

    expect(createdBlogs.body[0].likes).toBe(0)
})

test('if title or url is missing the response is a 404 error', async () => {

    const blog = { author: 'Unknown author', url: 'this is an url' }

    await api.post('/api/blogs')
        .set('Authorization', token)
        .send(blog)
        .expect(404)

    const blog2 = { title: 'A new blog', author: 'Unknown author' }

    await api.post('/api/blogs')
        .set('Authorization', token)
        .send(blog2)
        .expect(404)

    const blogs = await api.get('/api/blogs')
        .set('Authorization', token)
        .expect(200)
        .expect('Content-Type', /application\/json/)

    expect(blogs.body).toHaveLength(0)

})

test('make sure a blog is deleted', async () => {
    const blog = { author: 'Unknown author', url: 'this is an url', title: 'test' }
    const blogsAtStart = (await api.get('/api/blogs').set('Authorization', token)).body

    const newBlog = await api.post('/api/blogs')
        .set('Authorization', token)
        .send(blog).expect(201)

    await api.delete(`/api/blogs/${newBlog.body.id}`)
        .set('Authorization', token)
        .expect(204)

    const blogsAtEnd = (await api.get('/api/blogs').set('Authorization', token)).body
    expect(blogsAtEnd).toHaveLength(blogsAtStart.length)
})

test('make sure a blog is updated', async () => {
    const blog = { author: 'Unknown author', url: 'this is an url', title: 'test' }
    const newBlog = await api.post('/api/blogs')
        .set('Authorization', token)
        .send(blog).expect(201)

    const blogToUpdate = { ...newBlog.body, likes: 100 }

    const updatedBlog = await api.put(`/api/blogs/${newBlog.body.id}`)
        .set('Authorization', token)
        .send(blogToUpdate)
        .expect(200)

    expect(updatedBlog.body.likes).toBe(blogToUpdate.likes)
})

test('unauthorized status if token is not sent', async () => {
    const blog = { author: 'Unknown author', url: 'this is an url', title: 'test' }

    await api.post('/api/blogs')
        .send(blog).expect(401)
})

afterAll(() => {
    mongoose.connection.close()
})