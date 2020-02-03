import { OrderUtils, WithDependencies } from './OrderUtils';

class MockWithDependencies implements WithDependencies {
  constructor(public dependecies: MockWithDependencies[], public id?: String) {}
  public getDependencies() {
    return this.dependecies;
  }
  public toString() {
    return this.id;
  }
}

describe('OrderUtils', function() {
  describe('orderDependencies', function() {
    it('orders dependencies correctly', function() {
      let _1 = new MockWithDependencies([]);
      let _2 = new MockWithDependencies([_1]);
      let _3 = new MockWithDependencies([_1, _2]);

      let ordered = OrderUtils.orderDependencies([_1, _2, _3]);
      let resolved = [];

      for (let item of ordered) {
        let dependecies = item.getDependencies();
        if (dependecies.length !== 0) {
          // some implementations may return a different order so a deep copy wouldn't be robust enough, it checks that the order is correct
          for (const dependency of dependecies) {
            expect(resolved.includes(dependency)).toBe(true);
          }
        }
        resolved.push(item);
      }
    });

    it('orders dependencies correctly when params given unordered', function() {
      let _1 = new MockWithDependencies([], '1');
      let _2 = new MockWithDependencies([_1], '2');
      let _3 = new MockWithDependencies([_1, _2], '3');
      let _4 = new MockWithDependencies([_3], '4');

      let ordered = OrderUtils.orderDependencies([_1, _2, _4, _3]);
      let resolved = [];

      for (let item of ordered) {
        let dependecies = item.getDependencies();
        if (dependecies.length !== 0) {
          for (const dependency of dependecies) {
            expect(resolved.includes(dependency)).toBe(true);
          }
        }
        resolved.push(item);
      }
    });

    it('it returns null on circle dependency', function() {
      let _1 = new MockWithDependencies([], '1');
      let _2 = new MockWithDependencies([_1], '2');
      let _3 = new MockWithDependencies([_1, _2], '3');
      let _4 = new MockWithDependencies([_1, _2, _3], '3');
      _3.dependecies.push(_4);

      let ordered = OrderUtils.orderDependencies([_1, _3, _2]);
      expect(ordered).toBe(null);
    });
  });
});
