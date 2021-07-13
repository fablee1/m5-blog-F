import { Router } from "express"

import createError from "http-errors"
import postAuthorsMiddlewares from "./../../middlewares/validation/authors/postAuthors.js"
import putAuthorMiddlewares from "../../middlewares/validation/authors/putAuthors.js"
import { getAuthorsCsv } from "../../utils/csv.js"

import AuthorModel from "./schema.js"
import db from "../../utils/db.js"

const authorsRouter = Router()

authorsRouter.get("/csv", (req, res, next) => {
  try {
    getAuthorsCsv(res)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

authorsRouter.get("/", async (req, res, next) => {
  try {
    const query = "SELECT * FROM authors ORDER BY created_at DESC"
    const data = await db.query(query)
    res.send(data.rows)
  } catch (error) {
    next(error)
  }
})

authorsRouter.get("/:id", async (req, res, next) => {
  try {
    const author = await AuthorModel.findById(req.params.id)
    res.send(author)
  } catch (error) {
    next(error)
  }
})

authorsRouter.post("/", postAuthorsMiddlewares, async (req, res, next) => {
  try {
    const avatar = `https://ui-avatars.com/api/?name=${req.body.name}+${req.body.surname}`
    const newUser = new AuthorModel({
      ...req.body,
      avatar,
    })
    const { _id } = await newUser.save(newUser)
    res.status(201).send({ _id })
  } catch (error) {
    next(error)
  }
})

authorsRouter.put("/:id", putAuthorMiddlewares, async (req, res, next) => {
  try {
    const updatedAuthor = await AuthorModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (updatedAuthor) {
      res.send(updatedAuthor)
    } else {
      next(createError(400, "Author does not exist!"))
    }
  } catch (error) {
    next(error)
  }
})

authorsRouter.delete("/:id", async (req, res, next) => {
  try {
    const deletedAuthor = await AuthorModel.findByIdAndDelete(req.params.id)
    if (deletedAuthor) {
      res.status(204).send()
    } else {
      next(createError(404, `Author with _id ${req.params.id} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

authorsRouter.post("/checkEmail", async (req, res, next) => {
  try {
    const user = await AuthorModel.findOne({ email: req.body.email })
    if (user) {
      res.status(201).send({ exists: true })
    } else {
      res.status(201).send({ exists: false })
    }
  } catch (error) {
    next(error)
  }
})

export default authorsRouter
