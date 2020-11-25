import _ from "../src/object";

describe("Object Test: keysIn and valuesIn", () => {

  test('_.keys', () => {

    const someone: any = {
      name: "michael",
      age: 20,
    };

    expect(_.keys(someone)).toEqual(["name", "age"]);

    someone.job = "Software Engineer";

    expect(_.keys(someone)).toEqual(["name", "age", "job"]);
  });

  test('_.values', () => {

    const someone: any = {
      name: "michael",
      age: 20,
    };

    expect(_.values(someone)).toEqual(["michael", 20]);

    someone.job = "Software Engineer";

    expect(_.values(someone)).toEqual(["michael", 20, "Software Engineer"]);
  });

});

describe("Object Test: findKey", () => {
  const users = {
    'barney': { 'age': 36, 'active': true },
    'fred': { 'age': 40, 'active': false },
    'pebbles': { 'age': 1, 'active': true }
  };

  test('_.findKey - case1', () => {

    expect(_.findKey(users, (obj: any) => {
      return obj.age < 40;
    })).toEqual("barney");
  });

  test('_.findKey - case2', () => {

    expect(_.findKey(users, { 'age': 1, 'active': true })).toEqual("pebbles");
  });

  test('_.findKey - case3', () => {

    expect(_.findKey(users, 'active')).toEqual("barney");
  });
});

describe("Object Test: assign", () => {

  test('_.assign', () => {

    const foo = { a: 1 };
    const bar = { c: 3 };

    const a = { 'a': 0 };

    expect(_.assign(a, foo, bar)).toEqual({ a: 1, c: 3 });

    // don't influence source object
    expect(a).toEqual({ a: 0 });
  });
});

describe("Object Test: mapKeys and mapValues", () => {

  test('_.mapKeys', () => {

    expect(_.mapKeys({ 'a': 1, 'b': 2 }, (value, key) => {
      return key + value;
    })).toEqual({ 'a1': 1, 'b2': 2 });
  });

  test('_.mapValues', () => {

    const users = {
      'fred': { 'user': 'fred', 'age': 40 },
      'pebbles': { 'user': 'pebbles', 'age': 1 }
    };

    expect(_.mapValues(users, function (o) {
      return o.age;
    })).toEqual({ 'fred': 40, 'pebbles': 1 });

    expect(_.mapValues(users, function (o) {
      o.nation = "China";
      return o;
    })).toEqual({
      'fred': { 'user': 'fred', 'age': 40, nation: "China" },
      'pebbles': { 'user': 'pebbles', 'age': 1, nation: "China" }
    });
  });
});


describe("Object Test: set and get", () => {

  test('_.get - array', () => {

    const object = { 'a': [{ 'b': { 'c': 3 } }] };

    expect(_.get(object, ['a', '0', 'b', 'c'])).toEqual(3);
  });

  test('_.get - string', () => {

    const object = { 'a': [{ 'b': { 'c': 3 } }] };

    expect(_.get(object, 'a[0].b.c')).toEqual(3);
  });

  test('_.get - can not find the property', () => {

    const object = { 'a': [{ 'b': { 'c': 3 } }] };

    expect(_.get(object, 'a[0].x.y.z')).toBeUndefined();
  });

  test('_.set', () => {

    const object: any = { 'a': [{ 'b': { 'c': 3 } }] };

    _.set(object, 'a[0].b.c', 4);

    expect(object.a[0].b.c).toEqual(4);

    _.set(object, ['x', '0', 'y', 'z'], 5);

    expect(object.x[0].y.z).toEqual(5);

    expect(object).toEqual({ 'a': [{ 'b': { 'c': 4 } }], 'x': [{ 'y': { 'z': 5 } }] });
  });
});
