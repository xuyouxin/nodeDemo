import _ from "../src/array";

describe("array Test", () => {

  test('_.chunk', () => {

    expect(_.chunk(['a', 'b', 'c', 'd'], 2)).toEqual([['a', 'b'], ['c', 'd']]);

    expect(_.chunk(['a', 'b', 'c', 'd'], 3)).toEqual([['a', 'b', 'c'], ['d']]);
  });

  test('_.compact', () => {

    expect(_.compact([0, 1, false, 2, '', 3])).toEqual([1, 2, 3]);
  });

  test('_.fill', () => {

    expect(_.fill(Array(3), 2)).toEqual([2, 2, 2]);

    expect(_.fill([4, 6, 8, 10], '*', 1, 3)).toEqual([4, '*', '*', 10]);
  });

  test('_.flatten', () => {

    expect(_.flatten([1, [2, [3, [4]], 5]])).toEqual([1, 2, [3, [4]], 5]);
  });

  test('_.flattenDeep', () => {

    expect(_.flattenDeep([1, [2, [3, [4]], 5]])).toEqual([1, 2, 3, 4, 5]);
  });

  test('_.without', () => {

    const array = ['a', 'b', 'c', 'a', 'b', 'c', 'd'];

    expect(_.without(array, 'a', 'c')).toEqual(['b', 'b', 'd']);
  });

  test('_.remove', () => {

    const array = [1, 2, 3, 4];

    expect(_.remove(array, function (n) {
      return n % 2 == 0;
    })).toEqual([1, 3]);
  });

  test('[].reverse', () => {

    expect([1, 2, 3, 4].reverse()).toEqual([4, 3, 2, 1]);
  });

  test('[].slice', () => {

    expect([1, 2, 3, 4, 5, 6].slice(2, 4)).toEqual([3, 4]);

    expect([1, 2, 3, 4, 5, 6].slice(0, 3)).toEqual([1, 2, 3]);

    expect([1, 2, 3, 4, 5, 6].slice(2)).toEqual([3, 4, 5, 6]);
  });

  test('_.take', () => {

    expect(_.take([1, 2, 3], 2)).toEqual([1, 2]);
  });

  test('_.uniq', () => {

    expect(_.uniq([2, 1, 2])).toEqual([2, 1]);
  });

  test('_.uniqBy', () => {

    expect(_.uniqBy([2.1, 1.2, 2.3], Math.floor)).toEqual([2.1, 1.2]);

    expect(_.uniqBy([{ 'x': 1 }, { 'x': 2 }, { 'x': 1 }], 'x')).toEqual([{ 'x': 1 }, { 'x': 2 }]);
  });

  test('_.zip', () => {

    expect(_.zip(['a', 'b'], [1, 2], [true, false])).toEqual([['a', 1, true], ['b', 2, false]]);

    expect(_.zip(['a', 'b'], [1], [true])).toEqual([['a', 1, true], ['b', undefined, undefined]]);

    expect(_.zip(['a'], [1], [true, false])).toEqual([['a', 1, true], [undefined, undefined, false]]);
  });

  test('_.zipWith', () => {

    expect(_.zipWith([[1, 2], [10, 20], [100, 200]], function (a: number, b: number, c: number) {
      return a + b + c;
    })).toEqual([111, 222]);
  });

  test('_.unzip', () => {

    // _.unzip is reverse of _.zip, but it's no need
    expect(_.zip(...[['a', 1, true], ['b', 2, false]])).toEqual([['a', 'b'], [1, 2], [true, false]]);
  });

});
