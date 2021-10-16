export default function (name: string, func: (value: any) => boolean, okValues: any[], koValues: any[]): void {
  describe(name, () => {
    okValues.forEach((value: any) => it(`accepts ${JSON.stringify(value)}`, () => expect(func(value)).toStrictEqual(true)))
    koValues.forEach((value: any) => it(`rejects ${JSON.stringify(value)}`, () => expect(func(value)).toStrictEqual(false)))
  })
}
