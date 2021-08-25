import createError from "http-errors"
import { verifyJWT } from "./tools.js"
import AuthorModel from "../services/authors/schema.js"

export const JWTAuth = async (req, res, next) => {
  if (!req.headers.authorization) {
    next(createError(401, "Please provide credentials in the Authorization header!"))
  } else {
    try {
      const token = req.headers.authorization.replace("Bearer ", "")
      const data = await verifyJWT(token)
      const user = await AuthorModel.findById(data._id)
      if (user) {
        req.user = user
        next()
      } else {
        next(createError(404, "User is not found!"))
      }
    } catch (error) {
      next(createError(401, "Token has expired!"))
    }
  }
}
