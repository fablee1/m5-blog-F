import PdfPrinter from "pdfmake"
import imageToBase64 from "image-to-base64"
import { findById, streamToBase64 } from "./file-utils.js"
import striptags from "striptags"

const getImageB64FromUrl = async (url) => {
  const b64 = await imageToBase64(url)
  return b64
}

export const generatePDFReadableStream = async (post) => {
  const fonts = {
    Roboto: {
      normal: "Helvetica",
      bold: "Helvetica-Bold",
      italics: "Helvetica-Oblique",
      bolditalics: "Helvetica-Oblique",
    },
  }

  const printer = new PdfPrinter(fonts)

  const docDefinition = {
    content: [
      {
        text: post.title,
        style: "header",
      },
      {
        columns: [
          {
            text: `${post.author.name} ${post.author.surname}`,
            alignment: "center",
          },
          {
            text: post.readTime.value + " second read",
            alignment: "center",
          },
          {
            text: post.createdAt.slice(0, 10),
            alignment: "center",
          },
        ],
      },
      {
        image:
          "data:image/jpeg;base64," + (await getImageB64FromUrl(post.cover)),
        width: 500,
      },
      striptags(post.content),
    ],
    styles: {
      header: {
        fontSize: 25,
        bold: true,
        alignment: "center",
      },
    },
  }
  const pdfReadableStream = printer.createPdfKitDocument(docDefinition, {})
  pdfReadableStream.end()
  return pdfReadableStream
}

export const getPostPdfInB64 = async (id) => {
  const post = await findById(id, "posts.json")
  const pdfStream = await generatePDFReadableStream(post)
  const data = streamToBase64(pdfStream)
  return data
}
