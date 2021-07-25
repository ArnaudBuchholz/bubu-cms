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
  IsStoredRecordId,
  IsStoredRecordRating,
  isStoredRecordRefs,
  MAX_STOREDRECORDNAME_LENGTH,
  MAX_STOREDRECORDICON_LENGTH,
  isStoredRecord
} from '../../src/types/StoredRecord'

describe('types/StoredRecord', () => {
  function testTypeGuardFunc (name: string, func: (value: any) => boolean, okValues: any[], koValues: any[]): void {
    describe(name, () => {
      okValues.forEach((value: any) => it(`accepts ${JSON.stringify(value)}`, () => expect(func(value)).toEqual(true)))
      koValues.forEach((value: any) => it(`rejects ${JSON.stringify(value)}`, () => expect(func(value)).toEqual(false)))
    })
  }

  testTypeGuardFunc('isFieldValue', isFieldValue, [
    '', 'Hello World !', ''.padStart(MAX_FIELDVALUE_LENGTH, 'abc'), 0, 1, 2, -1, -2, new Date()
  ], [
    undefined, null, false, true, ''.padStart(MAX_FIELDVALUE_LENGTH + 1, 'abc'), 0.5, {}, Symbol('whatever'), function () {}
  ])

  testTypeGuardFunc('isFieldName', isFieldName, [
    'a', 'anyField', 'AVeryLongFieldName', ''.padStart(MAX_FIELDNAME_LENGTH, 'abc')
  ], [
    '', ' a', 'a ', ''.padStart(MAX_FIELDNAME_LENGTH + 1, 'abc'), '_abc', '$abc'
  ])

  testTypeGuardFunc('isFields', isFields, [
    {},
    { a: 'a' },
    { a: 'a', b: 1, c: new Date() }
  ], [
    null,
    undefined,
    new Date(),
    { '': false },
    { a: 3.5 },
    { b: null },
    { d: undefined }
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

  testTypeGuardFunc('IsStoredRecordRating', IsStoredRecordRating, [
    1, 2, 3, 4, 5
  ], [
    undefined, null, '', true, false, 0, 6, -1, -2
  ])

  testTypeGuardFunc('isStoredRecordRefs', isStoredRecordRefs, [
    {}, { $type: ['$tag'] }, { any: ['123', 'abc_$%?&'] }, { $type: ['$tag'], any: ['123', 'abc_$%?&'] }
  ], [
    undefined, null, '', true, false, 0, new Date(), { ' a ': [] }, { $type: 0 }
  ])

  testTypeGuardFunc('isStoredRecord', isStoredRecord, [{
    type: $type,
    id: '123',
    name: 'Hello World',
    fields: {},
    refs: {}
  }, {
    type: $type,
    id: '123',
    name: ''.padEnd(MAX_STOREDRECORDNAME_LENGTH, 'Hello World'),
    fields: {},
    refs: {}
  }, {
    type: $type,
    id: '123',
    name: 'Hello World',
    icon: 'test.jpg',
    fields: {},
    refs: {}
  }, {
    type: $type,
    id: '123',
    name: 'Hello World',
    icon: ''.padEnd(MAX_STOREDRECORDICON_LENGTH, 'test.jpg'),
    fields: {},
    refs: {}
  }, {
    type: $type,
    id: '123',
    name: 'Hello World',
    rating: 2,
    fields: {},
    refs: {}
  }, {
    type: $type,
    id: '123',
    name: 'Hello World',
    touched: new Date(),
    fields: {},
    refs: {}
  }], [undefined, null, '', true, false, 0, {
  }, {
    type: '$nope',
    id: '123',
    name: 'Hello World',
    fields: {},
    refs: {}
  }, {
    type: 'any',
    id: '',
    name: 'Hello World',
    fields: {},
    refs: {}
  }, {
    type: 'any',
    id: '123',
    name: '',
    fields: {},
    refs: {}
  }, {
    type: 'any',
    id: '123',
    name: ''.padEnd(MAX_STOREDRECORDNAME_LENGTH + 1, 'Hello World'),
    fields: {},
    refs: {}
  }, {
    type: 'any',
    id: '123',
    name: 'Hello world',
    icon: 123,
    fields: {},
    refs: {}
  }, {
    type: 'any',
    id: '123',
    name: 'Hello world',
    icon: ''.padEnd(MAX_STOREDRECORDICON_LENGTH + 1, 'test.jpg'),
    fields: {},
    refs: {}
  }, {
    type: 'any',
    id: '123',
    name: 'Hello world',
    touched: 123,
    fields: {},
    refs: {}
  }, {
    type: 'any',
    id: '123',
    name: 'Hello world',
    refs: {}
  }, {
    type: 'any',
    id: '123',
    name: 'Hello world',
    fields: {}
  }])
})
