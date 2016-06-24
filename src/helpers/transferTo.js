import _ from 'lodash'

export const transferTo = (items, array, comparator) => {
  comparator = typeof comparator === 'function' ? comparator : v => _.get(v, comparator)

  const result = array.slice()
  const __array = array.map(comparator)
  // Used O(n²) implementation because higher-order functions cannot be
  // unique keys if they use the same decorator (in JavaScript)
  items.map(comparator).forEach((v1, i1) => {
    const i2 = __array.findIndex(v2 => v1 === v2)
    const v2 = __array[i2]
    if (v1 === v2 && v1 !== undefined) result[i1] = items[i2]
  })

  return result
}
