import s from "sequelize"
import pg from "pg"
import PostModel from "./posts.js"
const Sequelize = s.Sequelize
const DataTypes = s.DataTypes
const { PGUSER, PGDATABASE, PGPASSWORD, PGHOST } = process.env

const sequelize = new Sequelize(PGDATABASE, PGUSER, PGPASSWORD, {
  host: PGHOST,
  dialect: "postgres",
})
const pool = new pg.Pool()
const test = async () => {
  try {
    await sequelize.authenticate()
    console.log("Connection has been established successfully.")
  } catch (error) {
    console.error("Unable to connect to the database:", error)
  }
}

const models = {
  Post: PostModel(sequelize, DataTypes),
  sequelize: sequelize,
  pool: pool,
}
test()

export default models
