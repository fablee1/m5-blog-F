import { pipeline } from "stream"
import { Transform } from "json2csv"
import { getAuthorsReadableStream } from "./file-utils.js"

export const getAuthorsCsv = (res) => {
  const source = getAuthorsReadableStream()
  const fields = ["_id", "name", "surname", "email", "dob"]
  const options = { fields }
  const transform = new Transform(options)
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=authors-${new Date().toISOString()}.csv`
  )
  console.log("ok")
  pipeline(source, transform, res, (err) => {
    if (err) next(err)
  })
}
