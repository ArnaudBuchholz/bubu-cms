export function isThenable<T> (value: any): value is Promise<T> {
  return typeof value === 'object' && value !== null && typeof value.then === 'function'
}

export function isA<T> (checker: (value: any) => void): (value: any) => value is T {
  return function (value: any): value is T {
    try {
      checker(value)
      return true
    } catch (e) {
      return false
    }
  }
}
