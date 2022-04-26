export class NotATypeError extends Error {
  constructor (
    private readonly _type: string,
    private readonly _reason: NotATypeError | Error | null = null
  ) {
    super(`Invalid ${_type}`)
  }

  get reason (): NotATypeError | Error | null {
    return this._reason
  }
}

export function notA (type: string, reason: NotATypeError | Error | null = null): never {
  throw new NotATypeError(type, reason)
}

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

export function checkA (type: string, checkFunction: () => void): void {
  try {
    checkFunction()
  } catch (e) {
    if (e instanceof Error) {
      notA(type, e)
    }
    throw e
  }
}

export function checkDate (value: any): asserts value is Date {
  if (typeof value !== 'object' ||
    value === null ||
    Object.prototype.toString.call(value) !== '[object Date]') {
    notA('Date')
  }
}
export const isDate = isA(checkDate)

export type LiteralObject = Record<string, any>
export function checkLiteralObject (value: any): asserts value is LiteralObject {
  if (typeof value !== 'object' ||
    Object.prototype.toString.call(value) !== '[object Object]' ||
    Object.getPrototypeOf(value) !== Object.getPrototypeOf({})) {
    notA('LiteralObject')
  }
}
export const isLiteralObject = isA(checkLiteralObject)

export function isThenable<T> (value: any): value is Promise<T> {
  return typeof value === 'object' && value !== null && typeof value.then === 'function'
}
