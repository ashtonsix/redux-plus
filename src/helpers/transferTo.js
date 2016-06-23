import _ from 'lodash'

export const transferTo = (orignalArray, updatedArray, comparator) => {
  comparator = typeof comparator === 'function' ? comparator : v => _.get(v, comparator)

  const result = updatedArray.slice()
  const __updated = updatedArray.map(comparator)
  // Used O(n²) implementation because higher-order functions cannot be
  // unique keys if they use the same decorator (in JavaScript)
  orignalArray.map(comparator).forEach((v1, i1) => {
    const i2 = __updated.findIndex(v2 => v1 === v2)
    const v2 = __updated[i2]
    if (v1 === v2) result[i1] = orignalArray[i2]
  })

  return result
}
