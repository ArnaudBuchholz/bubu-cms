export function convert (PageMethods: Function): Record<string, () => {}> {
  const dictionary: Record<string, () => {}> = {}
  Object.getOwnPropertyNames(PageMethods.prototype)
    .filter(name => name !== 'constructor' && typeof PageMethods.prototype[name] === 'function')
    .forEach(name => {
      dictionary[name] = PageMethods.prototype[name]
    })
  return dictionary
}
