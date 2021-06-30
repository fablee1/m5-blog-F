import { checkSchema, validationResult } from "express-validator"
import { readFile } from "../../../utils/file-utils.js"
import createError from "http-errors"
import { filterAuthorsBody } from "./../../sanitize/authors/authorsSanitize.js"

const schema = {
  name: {
    in: ["body"],
    optional: { options: { nullable: true } },
    isString: {
      errorMessage: "Name must be string!",
    },
  },
  surname: {
    in: ["body"],
    optional: { options: { nullable: true } },
    isString: {
      errorMessage: "Surname must be string!",
    },
  },
  email: {
    in: ["body"],
    optional: { options: { nullable: true } },
    isEmail: {
      errorMessage: "Email must be a valid one!",
    },
  },
  dob: {
    in: ["body"],
    optional: { options: { nullable: true } },
    isDate: {
      errorMessage: "DOB must be a date",
    },
  },
}
const checkPutAuthorSchema = checkSchema(schema)

const validatePutAuthorSchema = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Putting authors went wrong!",
      errors: errors.array(),
    })
  } else {
    next()
  }
}

const checkPutEmailExists = async (req, res, next) => {
  const authors = await readFile("authors.json")
  if (
    req.body.email
      ? !authors.some(
          (a) => a.email === req.body.email && a._id !== req.params.id
        )
      : true
  ) {
    res.locals.authors = authors
    next()
  } else {
    next(
      createError(404, `Author with email ${req.body.email} does not exist!`)
    )
  }
}

const putAuthorMiddlewares = [
  checkPutAuthorSchema,
  validatePutAuthorSchema,
  filterAuthorsBody,
  checkPutEmailExists,
]

export default putAuthorMiddlewares
