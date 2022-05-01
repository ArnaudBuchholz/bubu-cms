export function testIsA (name: string, func: (value: any) => boolean, okValues: any[], koValues: any[]): void {
  describe(name, () => {
    okValues.forEach((value: any) => it(`accepts ${JSON.stringify(value)}`, () => expect(func(value)).toStrictEqual(true)))
    koValues.forEach((value: any) => it(`rejects ${JSON.stringify(value)}`, () => expect(func(value)).toStrictEqual(false)))
  })
}

interface TypeIsAndCheck {
  is: (value: any) => boolean
  check: (value: any) => void
}

export function testType (name: string, methods: TypeIsAndCheck, okValues: any[], koValues: any[]): void {
  describe(name, () => {
    okValues.forEach((value: any) => {
      it(`check accepts ${JSON.stringify(value)}`, () => expect(() => methods.check(value)).not.toThrowError())
      it(`is accepts ${JSON.stringify(value)}`, () => expect(methods.is(value)).toStrictEqual(true))
    })
    koValues.forEach((value: any) => {
      it(`check rejects ${JSON.stringify(value)}`, () => expect(() => methods.check(value)).toThrowError())
      it(`is rejects ${JSON.stringify(value)}`, () => expect(methods.is(value)).toStrictEqual(false))
    })
  })
}
