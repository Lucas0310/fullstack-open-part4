const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const reducer = (sum, item) => sum + item

  const likesList = blogs.map(blog => blog.likes)

  return likesList.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
  const reducer = (max, item) => Math.max(max, item)

  const mostLikes = blogs.map(blog => blog.likes).reduce(reducer, 0)
  const mostLikedBlog = blogs.filter(blog => blog.likes === mostLikes)

  return mostLikedBlog
}

const mostBlogs = (blogs) => {

  const blogsGroupedByAuthors = (blogs) => {
    const groupedByBlogs = new Map()

    for (const { author } of blogs) {
      if (!groupedByBlogs.get(author)) {
        groupedByBlogs.set(author, { author: author, blogs: 1 })
      } else {
        let previousValue = groupedByBlogs.get(author)
        groupedByBlogs.set(author, { ...previousValue, blogs: previousValue.blogs + 1 })
      }
    }

    return Array.from(groupedByBlogs.values())
  }

  const reducer = (acc, liteBlog) => acc.blogs > liteBlog.blogs ? acc : liteBlog
  const groupedBlogs = blogsGroupedByAuthors(blogs)
  return groupedBlogs.reduce(reducer, groupedBlogs[0])
}

const mostLikes = (blogs) => {

  const blogsGroupedByLikes = (blogs) => {
    const groupedByLikes = new Map()

    for (const { author, likes } of blogs) {
      if (!groupedByLikes.get(author)) {
        groupedByLikes.set(author, { author: author, likes: likes })
      } else {
        let previousValue = groupedByLikes.get(author)
        groupedByLikes.set(author, { ...previousValue, likes: previousValue.likes + likes })
      }
    }

    return Array.from(groupedByLikes.values())
  }

  const reducer = (acc, liteBlog) => acc.likes > liteBlog.likes ? acc : liteBlog
  const groupedLikes = blogsGroupedByLikes(blogs)
  return groupedLikes.reduce(reducer, groupedLikes[0])
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
}