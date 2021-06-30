import _ from "lodash"

const filterBody = (obj, keys) => {
  return _.pick(obj, keys)
}
export default filterBody
