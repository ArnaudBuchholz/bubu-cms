export function isThenable<T> (value: any): value is Promise<T> {
  return typeof value === 'object' && value !== null && typeof value.then === 'function'
}
