import express from "express"

import listEndpoints from "express-list-endpoints"
import cors from "cors"
import createError from "http-errors"
import morgan from "morgan"
import mongoose from "mongoose"
import { createServer } from "http"

import authorsRouter from "./services/authors/index.js"
import postsRouter from "./services/posts/index.js"
import { errorMiddlewares } from "./middlewares/error/errors.js"
import cookieParser from "cookie-parser"
import passport from "passport"
import googleStrategy from "./auth/oauth.js"

const port = process.env.PORT || 3001
const server = express()

passport.use("google", googleStrategy)

// Middlewares
const whitelist = [process.env.FRONTEND_URL, process.env.FRONTEND_PROD_URL]

server.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || whitelist.indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        callback(new Error("Not allowed by cors!"))
      }
    },
    credentials: true,
  })
)
server.use(cookieParser())
server.use(passport.initialize())
server.use(express.json())
server.use(morgan("dev"))

server.use("/authors", authorsRouter)
server.use("/posts", postsRouter)

server.use([errorMiddlewares])

console.table(listEndpoints(server))

server.use((req, res) => {
  if (!req.route) {
    const error = createError(404, "This route is not found!")
    res.status(error.status).send(error)
  }
})

export const app = createServer(server)

mongoose
  .connect(process.env.MONGO_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() =>
    app.listen(port, () => {
      console.log("Server running on port ", port)
    })
  )
  .catch((err) => console.log(err))
