import {
  MAX_FIELDVALUE_LENGTH,
  isFieldValue,
  MAX_FIELDNAME_LENGTH,
  isFieldName,
  isFields,
  MAX_STOREDRECORDTYPE_LENGTH,
  $type,
  $tag,
  isStoredRecordType,
  MAX_STOREDRECORDID_LENGTH,
  IsStoredRecordId
} from '../../src/types/StoredRecord'

describe('types/StoredRecord', () => {
  function testTypeGuardFunc (name: string, func: (value: any) => boolean, okValues: any[], koValues: any[]): void {
    describe(name, () => {
      okValues.forEach((value: any) => it(`accepts ${JSON.stringify(value)}`, () => expect(func(value)).toEqual(true)))
      koValues.forEach((value: any) => it(`rejects ${JSON.stringify(value)}`, () => expect(func(value)).toEqual(false)))
    })
  }

  testTypeGuardFunc('isFieldValue', isFieldValue, [
    undefined, '', 'Hello World !', ''.padStart(MAX_FIELDVALUE_LENGTH, 'abc'), 0, 1, 2, -1, -2, new Date()
  ], [
    null, false, true, ''.padStart(MAX_FIELDVALUE_LENGTH + 1, 'abc'), 0.5, {}, Symbol('whatever'), function () {}
  ])

  testTypeGuardFunc('isFieldName', isFieldName, [
    'a', 'anyField', 'AVeryLongFieldName', ''.padStart(MAX_FIELDNAME_LENGTH, 'abc')
  ], [
    '', ' a', 'a ', ''.padStart(MAX_FIELDNAME_LENGTH + 1, 'abc'), '_abc', '$abc'
  ])

  testTypeGuardFunc('isFields', isFields, [
    {},
    { a: 'a' },
    { a: 'a', b: 1, c: new Date(), d: undefined }
  ], [
    null,
    undefined,
    new Date(),
    { '': false },
    { a: 3.5 },
    { b: null }
  ])

  testTypeGuardFunc('isStoredRecordType', isStoredRecordType, [
    $tag, $type, 'a', 'anyField', 'AVeryLongFieldName', ''.padStart(MAX_STOREDRECORDTYPE_LENGTH, 'abc')
  ], [
    '', ' a', 'a ', ''.padStart(MAX_STOREDRECORDTYPE_LENGTH + 1, 'abc'), '_abc', '$abc'
  ])

  testTypeGuardFunc('IsStoredRecordId', IsStoredRecordId, [
    $tag, $type, 'a', 'anyField', ''.padStart(MAX_STOREDRECORDID_LENGTH, 'abc')
  ], [
    '', ' a', 'a ', 'AVeryLongFieldName', ''.padStart(MAX_STOREDRECORDID_LENGTH + 1, 'abc')
  ])
})
