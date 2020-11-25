import _ from "../src/util";

describe("util Test", () => {

  test('_.match', () => {

    const objects = [
      { 'a': 1, 'b': 2, 'c': 3 },
      { 'a': 4, 'b': 5, 'c': 6 }
    ];
    const f = _.matches({ 'a': 4, 'c': 6 });

    expect(objects.filter(f)).toEqual([{ 'a': 4, 'b': 5, 'c': 6 }]);

  });

});
