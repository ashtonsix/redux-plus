function ReduceError(message) {
  this.name = 'ReduceError'
  this.message = message || 'Default Message'
  this.stack = (new Error()).stack
}

export const reduceInteruptable = (arr, f, initialValue) => {
  let val = initialValue
  const interupt = _val => {
    val = _val
    throw new ReduceError()
  }

  try {
    val = arr.reduce(
      (...args) => f(...args, interupt),
      val
    )
  } catch (e) {
    if (e instanceof ReduceError) return val
    else throw e // eslint-disable-line no-else-return
  }

  return val
}
