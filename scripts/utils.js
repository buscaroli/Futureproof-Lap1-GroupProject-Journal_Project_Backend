const { Console } = require('console')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')
let dataUrl = './scripts/data.json'

class Post {
  constructor(title, body, link = null) {
    this.id = uuidv4()
    this.title = title
    this.body = body
    this.link = link
    this.date = new Date()
    this.comments = []
    this.reactions = {
      laugh: 0,
      thumbUp: 0,
      poo: 0,
    }
    this.date = this.stringDate
  }

  get stringDate() {
    // return todayWithDay(this.date)
    return this.date.toString().replace('T', '').replace(/GM.+/i, '').trim()
  }

  get getData() {
    return {
      id: this.id,
      title: this.title,
      body: this.body,
      link: this.link,
      date: this.stringDate,
      comments: this.comments,
      reactions: this.reactions,
    }
  }
}

class Comment {
  constructor(body, postObject, link = null) {
    this.id = 0
    this.body = body
    this.link = link
    this.date = new Date()
    this.postRef = postObject.id
    this.date = this.stringDate
  }
  get stringDate() {
    // return todayWithDay(this.date)
    return this.date.toString().replace('T', '').replace(/GM.+/i, '').trim()
  }

  get getData() {
    return {
      id: this.id,
      body: this.body,
      link: this.link,
      date: this.stringDate,
      postRef: this.postRef,
    }
  }
}

// Utility Function
// reads the JSOn file, converts it to a JS Object and returns it
function readDataFromFile(filename) {
  try {
    const data = fs.readFileSync(filename)
    const jsonData = JSON.parse(data)
    // console.log(`readDataFromFile - logging JSOn string ->\n${data}\n `)
    // console.log('readDataFromFile - logginf JS object -> \n', jsonData)
    return jsonData
  } catch (err) {
    console.error(err)
  }
}

// Utility function
// takes the JSON data, converts it to JSON String, saves it and returns it
function writePostToFile(filename, data) {
  try {
    const stringData = JSON.stringify(data)
    // console.log('\nwritePostToFile - stringData -> ', stringData)
    fs.writeFileSync(filename, stringData)
    // return stringData
  } catch (err) {
    console.error(err)
  }
}

// Call when you have received a new Post from the frontend
// opens the file, appends the post saves the file and returns the data as JSON String
// ready to be sent back to the frontend

// Cannot use progressive ids as would be unable to delete posts
function addPost(post) {
  // console.log('postObject -> ', post)

  // getting the posts as a JS Object
  let data = readDataFromFile(dataUrl)

  const newPost = new Post(post.title, post.body, post.link)

  // adding the new Post to the data Array
  data = [...data, newPost]
  // console.log('\naddPost - data after post added -> ', data)
  writePostToFile(dataUrl, data)

  return data
}

// Find a post by using its UUID
function findPostById(postId, filename) {
  const allPostsObj = readDataFromFile(filename)
  console.log('\nfindPostByUUID - allPosts.Obj -> ', allPostsObj)
  // const postId = (post) => post.id
  console.log('\nfindPostByUUID - postId -> ', postId)

  console.log('\n===== findPostById - allPostsObj type -> ', typeof allPostsObj)

  const targetPostIndex = allPostsObj.findIndex((postElement, index) => {
    return postElement.id === postId
  })

  if (targetPostIndex === -1) {
    console.log('Post could not be found')
    return null
  } else {
    const targetPostObj = allPostsObj[targetPostIndex]
    console.log('\n findPostById - Returning the post: ', targetPostObj)
    return targetPostObj
  }
}

function deletePost(post) {
  const postId = post.id
  console.log('deletePost - postId: ', postId)

  // getting the posts as a JS Object
  const data = readDataFromFile(dataUrl)

  // filter the posts, leave out the one that has same id as postId
  const postIndex = data.findIndex((postElement) => postElement.id === postId)
  console.log('deletePost - postIndex: ', postIndex)

  if (postIndex === -1) {
    console.log('post not found')
    return null
  } else {
    const filteredPostsArray = data.filter(
      (postElement) => postElement.id !== post.id
    )
    console.log(filteredPostsArray)
    writePostToFile(dataUrl, filteredPostsArray)
    return filteredPostsArray
  }
}

function addComment(post, comment, filename) {
  const allPostsObj = readDataFromFile(filename)

  const newComment = new Comment(comment.body, post, comment.link)

  const targetPostIndex = allPostsObj.findIndex(
    (postElem) => postElem.id === post.id
  )

  if (targetPostIndex === -1) {
    return null
  } else {
    allPostsObj[targetPostIndex].comments.push(newComment)

    writePostToFile(dataUrl, allPostsObj)
    const retrievedPost = findPostById(post.id, dataUrl)
    return retrievedPost
  }
}

function addEmoji(post, emoji, filename) {
  const allPostsObj = readDataFromFile(filename)
  const targetPostIndex = allPostsObj.findIndex(
    (postElement) => postElement.id === post.id
  )
  console.log('addEmoji - targetPostIndex -> ', targetPostIndex)

  if (targetPostIndex === -1) {
    console.log('Could not increase emoji status as post was not found.')
    return null
  } else {
    const targetPost = allPostsObj[targetPostIndex]
    console.log('targetPost: ', targetPost)

    const emojiNum = Number(emoji)
    console.log('emojiNum -> ', emojiNum)

    const emojiToIncrease = convertNumToEmoji(emojiNum)
    console.log('emojiToIncrease -> ', emojiToIncrease)

    console.log('targetPost.reactions -> ', targetPost.reactions)

    console.log('*** ', targetPost.reactions.emojiToIncrease)

    const emojiCountNumber = targetPost.reactions[emojiToIncrease]
    console.log('emojiCountNumber -> ', emojiCountNumber)

    const increasedEmojiCounter = emojiCountNumber + 1
    console.log('increrasedEmojiCounter ', increasedEmojiCounter)

    const updatedReaction = (targetPost.reactions[emojiToIncrease] =
      increasedEmojiCounter)
    console.log('updatedReaction -> ', updatedReaction)

    console.log('updatedtargetPost ->', targetPost)

    // replace oldPost with new one
    allPostsObj.splice(targetPostIndex, 1, targetPost)
    console.log('allPostsObj ---> ', allPostsObj)

    const stringifiedPosts = JSON.stringify(allPostsObj)

    // cancel all the content of the file
    fs.writeFile(dataUrl, stringifiedPosts, 'utf8', () => {
      console.log('replaced data')
    })
    return allPostsObj
  }
}

function convertNumToEmoji(emojiNumber) {
  switch (emojiNumber) {
    case 0:
      return 'laugh'

    case 1:
      return 'thumbUp'

    case 2:
      return 'poo'

    default:
  }
}

module.exports = {
  addPost,
  findPostById,
  addComment,
  readDataFromFile,
  deletePost,
  addEmoji,
  dataUrl,
}
