const express = require('express')
const cors = require('cors')
const Post = require('./data')
const {
  addComment,
  findPostById,
  addPost,
  readDataFromFile,
  deletePost,
  addEmoji,
  dataUrl,
} = require('./utils.js')

const app = express()
app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
  res.send('Welcome to the Journal Enrties Page!')
})

app.get('/posts', (req, res) => {
  const allPosts = readDataFromFile(dataUrl)
  res.send(allPosts)
})

app.get('/posts/:id', (req, res) => {
  try {
    const post = String(req.params.id)
    console.log('server.js - GET /posts/:id - post', post)
    const retrievedPost = findPostById(post, dataUrl)
    if (!post) {
      throw new Error('this post does not exist')
    } else {
      res.send(retrievedPost)
    }
  } catch (err) {
    res.status(404).send({ message: err.message })
  }
})

app.post('/posts', (req, res) => {
  const newPost = req.body
  const updatedData = addPost(newPost)

  try {
    res.status(201).send(updatedData)
  } catch (err) {
    res.status(404).send({ error: err.message })
  }
})

app.delete('/posts', (req, res) => {
  try {
    const postToBeDeleted = req.body

    const filteredData = deletePost(postToBeDeleted)

    if (!filteredData) {
      throw new Error('this post does not exist')
    } else {
      res.status(200).send(filteredData)
    }
  } catch (err) {
    res.status(404).send({ error: err.message })
  }
})

app.post('/posts/comments', (req, res) => {
  try {
    const post = req.body.post
    const comment = req.body.comment
    console.log('posts/comments - post -> ', post)
    console.log('posts/comments - comment -> ', comment)

    const retrievedPostAndComments = addComment(post, comment, dataUrl)
    console.log(
      'server.js - posts/comments - retrievedPostsAndComments -> ',
      retrievedPostAndComments
    )

    if (!retrievedPostAndComments) {
      throw new Error('could not add the comment as post wasn;t found')
    }
    res.status(201).send(retrievedPostAndComments)
  } catch (err) {
    res.status(404).send({ error: err.message })
  }
})

app.post('/posts/emojis', (req, res) => {
  try {
    const post = req.body.post
    const clickedEmoji = req.body.emoji

    if (!post || !clickedEmoji) {
      throw new Error('Invalid data')
    } else {
      const newData = addEmoji(post, clickedEmoji, dataUrl)
      res.send(newData)
    }
  } catch (err) {
    res.status(405).send({ error: err.message })
  }
})

module.exports = app
