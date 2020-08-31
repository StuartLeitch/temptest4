import { Result } from '../../../core/logic/Result';
import { accessControl } from '../AccessControl';
import type { AccessControlContext } from '../AccessControlContext';

type Authorization = 'Authorization';

interface AuthorizationContext<T = string> {
  roles: T[];
}

interface AccessControlledUsecaseContract<R, C, ACC> {
  getAccessControlContext?(r: R, c: C): Promise<ACC>;
}

abstract class AccessControlledUsecase<R, C, ACC>
  implements AccessControlledUsecaseContract<R, C, ACC> {}

const Authorize = <R, C extends AuthorizationContext>(action: string) => (
  _target: AccessControlledUsecase<R, C, AccessControlContext>, // Class of the decorated method
  _propertyName: string, // method name
  propertyDescriptor: PropertyDescriptor
): PropertyDescriptor => {
  const method = propertyDescriptor.value;
  propertyDescriptor.value = async function (request: R, context: C) {
    const { roles } = context;
    const accessControlContext = await (_target as any).getAccessControlContext(
      request,
      context,
      {} as AccessControlContext
    );

    // Object.assign({}, accessControlContext, context);

    const permission = await accessControl.can(
      roles,
      action,
      accessControlContext
    );

    if (!permission.granted) {
      return Result.fail<Authorization>('UnauthorizedUserException');
    }

    const result = await method.call(this, request, context, permission);

    return result;
  };

  return propertyDescriptor;
};

export type {
  Authorization,
  AuthorizationContext,
  AccessControlledUsecaseContract,
};
export { Authorize, AccessControlContext, AccessControlledUsecase };
