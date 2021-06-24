import { left } from '../../../core/logic/Either';

import type { AccessControlContext } from '../AccessControlContext';
import { accessControl } from '../AccessControl';

type Authorization = 'Authorization';

interface AuthorizationContext<T = string> {
  roles: T[];
}

interface AccessControlledUsecaseContract<R, C, ACC> {
  getAccessControlContext?(r: R, c: C, a?: ACC): Promise<ACC>;
}

abstract class AccessControlledUsecase<R, C, ACC>
  implements AccessControlledUsecaseContract<R, C, ACC> {
  async getAccessControlContext?(r: R, c: C, a?: ACC): Promise<ACC> {
    return {} as ACC;
  }
}

const Authorize = <R, C extends AuthorizationContext>(action: string) => (
  _target: AccessControlledUsecase<R, C, AccessControlContext>, // Class of the decorated method
  _propertyName: string, // method name
  propertyDescriptor: PropertyDescriptor
): PropertyDescriptor => {
  const method = propertyDescriptor.value;
  propertyDescriptor.value = async function (request: R, context: C) {
    const { roles } = context;
    let accessControlContext = {};

    if (typeof _target.getAccessControlContext === 'function') {
      accessControlContext = await _target.getAccessControlContext(
        request,
        context,
        {} as AccessControlContext
      );
    }

    const permission = await accessControl.can(
      roles,
      action,
      accessControlContext
    );

    if (!permission.granted) {
      return left(new Error('UNAUTHORIZED'));
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
