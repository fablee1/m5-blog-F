import fs from "fs-extra"
import createError from "http-errors"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import { Base64Encode } from "base64-stream"
import concat from "concat-stream"

const __dirname = dirname(fileURLToPath(import.meta.url))

export const getDataFilePath = (name) => join(__dirname, "../data", name)

export const publicPath = join(__dirname, "../../public")

export const readFile = async (name) => {
  const filesJSONPath = getDataFilePath(name)
  const json = await fs.readJSON(filesJSONPath)
  return json
}

export const writeFile = async (name, content) => {
  const filesJSONPath = getDataFilePath(name)
  await fs.writeJSON(filesJSONPath, content)
}

export const getAuthorsReadableStream = () =>
  fs.createReadStream(getDataFilePath("authors.json"))

export const findById = async (id, name) => {
  const json = await readFile(name)
  const foundObject = json.find((obj) => obj._id === id)
  if (foundObject) {
    return foundObject
  } else {
    const error = createError(404, "This object not found")
    throw error
  }
}

export const findByIdAndDelete = async (id, name) => {
  let json = await readFile(name)
  const filesJSONPath = getDataFilePath(name)
  const foundObject = json.find((obj) => obj.id === id)
  if (foundObject) {
    json = json.filter((obj) => obj.id !== id)
    await fs.writeJSON(filesJSONPath, json)
    return foundObject
  } else {
    const error = createError(404, "This object not found")
    throw error
  }
}

export const findByIdAndUpdate = async (id, name, content) => {
  let json = await readFile(name)
  const filesJSONPath = getDataFilePath(name)
  const foundIndex = json.findIndex((obj) => obj.id === id)
  if (foundIndex !== -1) {
    let foundObject = json[foundIndex]
    foundObject = { ...foundObject, ...content, id, updatedAt: new Date() }
    json[foundIndex] = foundObject
    await fs.writeJSON(filesJSONPath, json)
    return foundObject
  } else {
    const error = createError(404, "This object not found")
    throw error
  }
}

export const streamToBase64 = (stream) => {
  return new Promise((resolve, reject) => {
    const base64 = new Base64Encode()

    const cbConcat = (base64) => {
      resolve(base64)
    }

    stream
      .pipe(base64)
      .pipe(concat(cbConcat))
      .on("error", (error) => {
        reject(error)
      })
  })
}
