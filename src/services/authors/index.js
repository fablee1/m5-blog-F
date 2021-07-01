import { Router } from "express"
import uniqid from "uniqid"
import { readFile, writeFile, findById } from "../../utils/file-utils.js"

import createError from "http-errors"
import postAuthorsMiddlewares from "./../../middlewares/validation/authors/postAuthors.js"
import putAuthorMiddlewares from "../../middlewares/validation/authors/putAuthors.js"
import { getAuthorsCsv } from "../../utils/csv.js"

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
    const authors = await readFile("authors.json")
    res.send(authors)
  } catch (error) {
    next(error)
  }
})

authorsRouter.get("/:id", async (req, res, next) => {
  try {
    const author = await findById(req.params.id, "authors.json")
    res.send(author)
  } catch (error) {
    next(error)
  }
})

authorsRouter.post("/", postAuthorsMiddlewares, async (req, res, next) => {
  try {
    const avatar = `https://ui-avatars.com/api/?name=${req.body.name}+${req.body.surname}`
    const newUser = {
      ...req.body,
      _id: uniqid(),
      createdAt: new Date(),
      updatedAt: new Date(),
      avatar: avatar,
    }
    res.locals.authors.push(newUser)
    await writeFile("authors.json", res.locals.authors)
    res.status(201).send({ _id: newUser._id })
  } catch (error) {
    next(error)
  }
})

authorsRouter.put("/:id", putAuthorMiddlewares, async (req, res, next) => {
  try {
    const users = res.locals.authors
    const targetUserIndex = users.findIndex(
      (user) => user._id === req.params.id
    )
    if (targetUserIndex !== -1) {
      const targetUser = users[targetUserIndex]
      users[targetUserIndex] = {
        ...targetUser,
        ...req.body,
        updatedAt: new Date(),
      }
      await writeFile("authors.json", users)
      res.status(200).send(users[targetUserIndex])
    } else {
      next(createError(400, "Author does not exist!"))
    }
  } catch (error) {
    next(error)
  }
})

authorsRouter.delete("/:id", async (req, res, next) => {
  try {
    const users = await readFile("authors.json")
    const remainingUsers = users.filter((user) => user._id !== req.params.id)
    await writeFile("authors.json", remainingUsers)
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

authorsRouter.post("/checkEmail", async (req, res, next) => {
  try {
    const users = await readFile("authors.json")
    if (users.some((user) => user.email === req.body.email)) {
      res.status(201).send({ exists: true })
    } else {
      res.status(201).send({ exists: false })
    }
  } catch (error) {
    next(error)
  }
})

export default authorsRouter
