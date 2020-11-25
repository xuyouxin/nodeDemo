import _ from "../src/lang";

describe("lang Test", () => {

  test('_.clone - object', () => {

    const source = { name: "jack", age: 20 };
    const target = _.clone(source);

    // clone successfully
    expect(target).toEqual(source);

    expect(source == target).toBeFalsy();

    // don't affect source object
    target.name = "mary";

    expect(source).toEqual({ name: "jack", age: 20 });

    expect(target).toEqual({ name: "mary", age: 20 });

  });

  test('_.clone - array', () => {

    const source = [{ 'a': 1 }, { 'b': 2 }];
    const target: any[] = _.clone(source);

    // clone successfully
    expect(target[0]).toEqual(source[0]);

    expect(source == target).toBeFalsy();

    // don't affect source object
    target.push({ c: 5 });

    expect(source).toEqual([{ 'a': 1 }, { 'b': 2 }]);

    expect(target).toEqual([{ 'a': 1 }, { 'b': 2 }, { c: 5 }]);
  });

});
