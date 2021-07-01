import sgMail from "@sendgrid/mail"
import striptags from "striptags"
import { getPostPdfInB64 } from "./pdf.js"

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

export const sendMail = async (post) => {
  const msg = {
    to: post.author.email,
    from: "william.carevs@gmail.com",
    templateId: "d-ba8c5e0b92ec407b963a0833f2143351",
    subject: `Your new post is live ${post.author.name}!`,
    dynamicTemplateData: {
      post: { ...post, content: striptags(post.content) },
      date: post.createdAt.slice(0, 10),
    },
    attachments: [
      {
        content: await getPostPdfInB64(post._id),
        filename: `${post.title}`,
        type: "application/pdf",
        disposition: "attachment",
        content_id: post._id,
      },
    ],
  }

  try {
    await sgMail.send(msg)
  } catch (err) {
    console.log(err)
  }
}
