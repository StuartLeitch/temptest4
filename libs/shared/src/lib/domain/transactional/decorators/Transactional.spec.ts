import { Transactional } from './Transactional';

class TestTransactional {
  constructor(public items: any[] = []) {}

  @Transactional()
  foo(bar: any) {
    this.items.push(bar);
  }
}

describe('Transactional', () => {
  // let expectedOutput: Result<any>;
  // let executeMethod: jest.Mock;
  let testTransactional: TestTransactional;
  // let verifyFn: jest.SpyInstance;
  // const request = {};

  beforeEach(() => {
    // expectedOutput = Result.ok({});
    // executeMethod = jest.fn();
    // executeMethod.mockResolvedValue(expectedOutput);
    testTransactional = new TestTransactional();
    // verifyFn = jest.spyOn(AccessControl.accessControl, 'can');
  });

  afterEach(() => {
    // verifyFn.mockRestore();
  });

  it('should simply let the method act as usual', async () => {
    testTransactional.foo('bar');

    expect(testTransactional.items.length).toEqual(1);
  });
});
