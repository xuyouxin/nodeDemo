import _ from "../src/collection";

describe("collection Test", () => {

  test("_.groupBy", () => {
    expect(_.groupBy([6.1, 4.2, 6.3], Math.floor)).toEqual({ '4': [4.2], '6': [6.1, 6.3] });

    expect(_.groupBy(['one', 'two', 'three'], (str: string) => str.length)).toEqual({
      '3': ['one', 'two'],
      '5': ['three']
    });
  });

  test('_.includes', () => {
    expect(_.includes([1, 2, 3], 1, 2)).toBeTruthy();

    expect(_.includes([1, 2, 3], 1, 5)).toBeFalsy();
  });

  test('_.keyBy', () => {
    const array = [
      { 'dir': 'left', 'code': 97 },
      { 'dir': 'right', 'code': 100 }
    ];

    expect(_.keyBy(array, function (o: any) {
      return String.fromCharCode(o.code);
    })).toEqual({
        'a': { 'dir': 'left', 'code': 97 },
        'd': { 'dir': 'right', 'code': 100 }
      }
    );

    expect(_.keyBy(array, 'dir')).toEqual({
      'left': { 'dir': 'left', 'code': 97 },
      'right': { 'dir': 'right', 'code': 100 }
    });
  });

  test('_.orderBy', () => {
    const users = [
      { 'user': 'fred', 'age': 48 },
      { 'user': 'barney', 'age': 34 },
      { 'user': 'fred', 'age': 40 },
      { 'user': 'barney', 'age': 36 }
    ];

    expect(_.orderBy(users, ['user', 'age'], ['asc', 'desc']))
      .toEqual([
        { 'user': 'barney', 'age': 36 },
        { 'user': 'barney', 'age': 34 },
        { 'user': 'fred', 'age': 48 },
        { 'user': 'fred', 'age': 40 },
      ]);
  });

  test('_.partition', () => {
    const users = [
      { 'user': 'barney', 'age': 36, 'active': false },
      { 'user': 'fred', 'age': 40, 'active': true },
      { 'user': 'pebbles', 'age': 1, 'active': false }
    ];

    expect(_.partition(users, function (o: any) {
      return o.active;
    }))
      .toEqual([[
        { 'user': 'fred', 'age': 40, 'active': true },
      ], [
        { 'user': 'barney', 'age': 36, 'active': false },
        { 'user': 'pebbles', 'age': 1, 'active': false },
      ]]);

    expect(_.partition(users, { 'age': 1, 'active': false }))
      .toEqual([[
        { 'user': 'pebbles', 'age': 1, 'active': false },
      ], [
        { 'user': 'barney', 'age': 36, 'active': false },
        { 'user': 'fred', 'age': 40, 'active': true },
      ]]);
  });

  test('_.shuffle', () => {
    const array = [1, 2, 3, 4, 5, 6];
    console.log(_.shuffle(array));
    console.log(_.shuffle(array));
    console.log(_.shuffle(array));
    console.log(_.shuffle(array));
    console.log(_.shuffle(array));
    console.log(_.shuffle(array));
    console.log(_.shuffle(array));
    console.log(_.shuffle(array));
  });

});
