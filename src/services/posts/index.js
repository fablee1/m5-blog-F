import { Router } from "express"
import uniqid from "uniqid"

import multer from "multer"
import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"

import createError from "http-errors"
import { readFile, findById, writeFile } from "../../utils/file-utils.js"
import { generatePDFReadableStream } from "./../../utils/pdf.js"

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "posts",
  },
})

const uploadOnCloudinary = multer({ storage: cloudinaryStorage }).single(
  "cover"
)

const postsRouter = Router()

postsRouter.get("/", async (req, res, next) => {
  try {
    const posts = await readFile("posts.json")
    res.send(posts)
  } catch (error) {
    next(error)
  }
})

postsRouter.get("/:id", async (req, res, next) => {
  try {
    const post = await findById(req.params.id, "posts.json")
    res.send(post)
  } catch (error) {
    next(error)
  }
})

postsRouter.post("/", async (req, res, next) => {
  try {
    const authors = await readFile("authors.json")
    const author = authors.find((a) => a._id === req.body.author)
    const readTime = {
      value: (req.body.content.length / 17).toPrecision(1),
      unit: "second",
    }
    const newPost = {
      ...req.body,
      _id: uniqid(),
      createdAt: new Date(),
      author,
      readTime,
    }
    const posts = await readFile("posts.json")
    posts.push(newPost)
    await writeFile("posts.json", posts)
    res.status(201).send({ _id: newPost._id })
  } catch (error) {
    next(error)
  }
})

postsRouter.post("/:id/upload", uploadOnCloudinary, async (req, res, next) => {
  try {
    const posts = await readFile("posts.json")
    const targetPostIndex = posts.findIndex((p) => p._id === req.params.id)
    if (targetPostIndex !== -1) {
      const targetPost = posts[targetPostIndex]
      if (req.body.url) {
        posts[targetPostIndex] = { ...targetPost, cover: req.body.url }
      } else {
        posts[targetPostIndex] = { ...targetPost, cover: req.file.path }
      }
      await writeFile("posts.json", posts)
      res.status(200).send(posts[targetPostIndex])
    } else {
      res.status(400).send({ error: "post does not exist" })
    }
  } catch (error) {
    next(error)
  }
})

postsRouter.put("/:id", async (req, res, next) => {
  try {
    const posts = await readFile("posts.json")
    const targetPostIndex = posts.findIndex((p) => p._id === req.params.id)
    if (targetPostIndex !== -1) {
      const targetPost = posts[targetPostIndex]
      posts[targetPostIndex] = { ...targetPost, ...req.body }
      await writeFile("posts.json", posts)
      res.status(200).send(posts[targetPostIndex])
    } else {
      res.status(400).send({ error: "post does not exist" })
    }
  } catch (error) {
    next(error)
  }
})

postsRouter.delete("/:id", async (req, res, next) => {
  try {
    const posts = await readFile("posts.json")
    const remainingPosts = posts.filter((p) => p._id !== req.params.id)
    await writeFile("posts.json", remainingPosts)
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

postsRouter.get("/:id/pdf", async (req, res, next) => {
  try {
    const post = await findById(req.params.id, "posts.json")
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${post.title}.pdf`
    )
    const pdfStream = await generatePDFReadableStream(post)
    console.log(pdfStream)
    pipeline(pdfStream, res, (err) => {
      if (err) next(err)
    })
  } catch (error) {
    next(error)
  }
})

export default postsRouter
