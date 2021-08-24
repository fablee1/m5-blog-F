import { Router } from "express"
import { pipeline } from "stream"

import multer from "multer"
import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"

import createError from "http-errors"
import { generatePDFReadableStream } from "./../../utils/pdf.js"

import PostModel from "./schema.js"
import { basicAuthMiddleware } from "../../auth/basic.js"

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "posts",
  },
})

const uploadOnCloudinary = multer({ storage: cloudinaryStorage }).single("cover")

const postsRouter = Router()

postsRouter.get("/", async (req, res, next) => {
  try {
    const posts = await PostModel.find().populate("author")
    res.send(posts)
  } catch (error) {
    next(error)
  }
})

postsRouter.get("/:id", async (req, res, next) => {
  try {
    const post = await PostModel.findById(req.params.id).populate("author")
    res.send(post)
  } catch (error) {
    next(error)
  }
})

postsRouter.post("/", basicAuthMiddleware, async (req, res, next) => {
  try {
    const readTime = {
      value: (req.body.content.length / 17).toPrecision(1),
      unit: "second",
    }
    const newPost = new PostModel({
      ...req.body,
      readTime,
    })
    const { _id } = await newPost.save(newPost)
    res.status(201).send({ _id })
  } catch (error) {
    console.log(error)
    next(error)
  }
})

postsRouter.post(
  "/:id/upload",
  basicAuthMiddleware,
  uploadOnCloudinary,
  async (req, res, next) => {
    try {
      let cover
      if (req.body.url) {
        cover = req.body.url
      } else {
        cover = req.file.path
      }
      const postWithCover = await PostModel.findByIdAndUpdate(
        req.params.id,
        { cover },
        {
          new: true,
          runValidators: true,
        }
      )
      if (postWithCover) {
        res.send(postWithCover)
      } else {
        next(createError(404, `Post with _id ${req.params.id} not found!`))
      }
    } catch (error) {
      next(error)
    }
  }
)

postsRouter.put("/:id", basicAuthMiddleware, async (req, res, next) => {
  try {
    const updatedPost = await PostModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (updatedPost) {
      res.send(updatedPost)
    } else {
      next(createError(404, `User with _id ${req.params.id} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

postsRouter.delete("/:id", basicAuthMiddleware, async (req, res, next) => {
  try {
    const deletedPost = await PostModel.findByIdAndDelete(req.params.id)
    if (deletedPost) {
      res.status(204).send()
    } else {
      next(createError(404, `Post with _id ${req.params.id} not found!`))
    }
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

postsRouter.get("/:id/pdf", async (req, res, next) => {
  try {
    const post = await findById(req.params.id, "posts.json")
    res.setHeader("Content-Disposition", `attachment; filename=${post.title}.pdf`)
    const pdfStream = await generatePDFReadableStream(post)
    pipeline(pdfStream, res, (err) => {
      if (err) next(err)
    })
  } catch (error) {
    next(error)
  }
})

export default postsRouter
