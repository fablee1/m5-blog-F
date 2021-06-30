const notFoundMiddleware = (err, req, res, next) => {
  if (err.status === 404) {
    res.status(404).send({ successful: false, message: err.message })
  } else {
    next(err)
  }
}

const badRequestMiddleware = (err, req, res, next) => {
  if (err.status === 400) {
    res.status(400).send(err.errorsList)
  } else {
    next(err)
  }
}

const catchErrorMiddleware = (err, req, res, next) => {
  res.status(500).send("Generic Server Error")
}

export const errorMiddlewares = [
  notFoundMiddleware,
  badRequestMiddleware,
  catchErrorMiddleware,
]
