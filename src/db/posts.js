export default (sequelize, DataTypes) => {
  const Post = sequelize.define("post", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    category: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    cover: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    read_time_value: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    read_time_unit: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    author: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  })
  return Post
}
