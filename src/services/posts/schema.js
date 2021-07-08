import mongoose from "mongoose"

const { Schema, model } = mongoose

const PostSchema = new Schema(
  {
    category: {
      type: String,
      required: true,
    },
    cover: {
      type: String,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    readTime: {
      value: {
        type: Number,
        required: true,
      },
      unit: {
        type: String,
        required: true,
      },
    },
    author: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Author",
    },
  },
  {
    timestamps: true,
  }
)

export default model("Post", PostSchema)
