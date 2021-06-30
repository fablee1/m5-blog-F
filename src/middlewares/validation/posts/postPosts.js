import { checkSchema, validationResult } from "express-validator"
import { readFile } from "../../../utils/file-utils.js"
import createError from "http-errors"

const schema = {
  title: {
    in: ["body"],
    exists: {
      errorMessage: "Title is mandatory",
    },
    isString: {
      errorMessage: "Title must be string!",
    },
  },
  category: {
    in: ["body"],
    exists: {
      errorMessage: "Category is mandatory",
    },
    isString: {
      errorMessage: "Category must be string!",
    },
  },
}
export const checkPostPostSchema = checkSchema(schema)

export const validatePostPostSchema = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Posting post went wrong!",
      errors: errors.array(),
    })
  } else {
    next()
  }
}
