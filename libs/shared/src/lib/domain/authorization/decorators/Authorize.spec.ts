import {Result} from '../../../core/logic/Result';
import * as AccessControl from '../AccessControl';
import {
  Authorize,
  AccessControlledUsecase
  // AuthorizationContext
} from './Authorize';

const accessControlContext = {} as AccessControl.AccessControlContext;

class TestUsecase extends AccessControlledUsecase<
  {},
  {},
  AccessControl.AccessControlContext
> {
  constructor(public fn: Function) {
    super();
  }

  private async getAccessControlContext(
    request,
    context,
    accessControlContext
  ) {
    return Promise.resolve(accessControlContext);
  }

  @Authorize('resource:action')
  async execute(request: any, context: any) {
    return this.fn(request, context);
  }
}

describe('Authorize', () => {
  let expectedOutput: Result<any>;
  let executeMethod: jest.Mock;
  let usecase: any;
  let verifyFn: jest.SpyInstance;
  const request = {};

  beforeEach(() => {
    expectedOutput = Result.ok({});
    executeMethod = jest.fn();
    executeMethod.mockResolvedValue(expectedOutput);
    usecase = new TestUsecase(executeMethod);
    verifyFn = jest.spyOn(AccessControl.accessControl, 'can');
  });

  afterEach(() => {
    verifyFn.mockRestore();
  });

  it('should call method if permission is granted', async () => {
    const context = {
      roles: ['admin']
    };
    verifyFn.mockResolvedValue({granted: true});
    await usecase.execute(request, context);

    expect(executeMethod).toBeCalledWith(request, context);
    expect(verifyFn).toHaveBeenCalledTimes(1);
    expect(verifyFn).toHaveBeenCalledWith(
      ['admin'],
      'resource:action',
      accessControlContext
    );
  });

  it('should not call method if permission is denied', async () => {
    const context = {
      roles: ['admin']
    };
    verifyFn.mockResolvedValue({granted: false});
    await usecase.execute(request, context);

    // expect(usecase.getAccessControlContext).toBeCalledWith(request, context);
    expect(executeMethod).not.toBeCalled();
    expect(verifyFn).toHaveBeenCalledTimes(1);
    expect(verifyFn).toHaveBeenCalledWith(
      ['admin'],
      'resource:action',
      accessControlContext
    );
  });
});
