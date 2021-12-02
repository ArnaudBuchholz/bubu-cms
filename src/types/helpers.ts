export function isA<T> (checker: (value: any) => asserts value is T): (value: any) => value is T {
  return function (value: any): value is T {
    try {
      checker(value)
      return true
    } catch (e) {
      return false
    }
  }
}

export function checkDate (value: any): asserts value is Date {
  if (typeof value !== 'object' ||
    value === null ||
    Object.prototype.toString.call(value) !== '[object Date]') {
    throw new Error('Expected date')
  }
}

export const isDate = isA(checkDate)

export type LiteralObject = Record<string, any>

export function checkLiteralObject (value: any): asserts value is LiteralObject {
  if (typeof value !== 'object' ||
    Object.prototype.toString.call(value) !== '[object Object]' ||
    Object.getPrototypeOf(value) !== Object.getPrototypeOf({}) ) {
    throw new Error('Expected literal object')
  }
}

export const isLiteralObject = isA(checkLiteralObject)

export function isThenable<T> (value: any): value is Promise<T> {
  return typeof value === 'object' && value !== null && typeof value.then === 'function'
}
