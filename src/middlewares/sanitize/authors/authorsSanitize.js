import filterBody from "./../filterBody.js"

const authorsFields = ["name", "surname", "email", "avatar", "dob", "password"]

export const filterAuthorsBody = (req, res, next) => {
  req["body"] = filterBody(req["body"], authorsFields)
  next()
}
