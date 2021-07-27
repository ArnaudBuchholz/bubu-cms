export function join (array1: any[], array2: any[]): any[] {
  return [...new Set([...array1, ...array2])]
}
