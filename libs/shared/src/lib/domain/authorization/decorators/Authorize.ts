import { AccessControlPlus } from 'accesscontrol-plus';

import type { AccessControlContext } from '../AccessControlContext';

import { left } from '../../../core/logic/Either';
import { accessControl } from '../AccessControl';

type Authorization = 'Authorization';

interface AuthorizationContext<T = string> {
  roles: T[];
}

interface AccessControlledUsecaseContract<R, C, ACC> {
  getAccessControlContext?(r: R, c: C): Promise<ACC>;
}

abstract class AccessControlledUsecase<R, C, ACC>
  implements AccessControlledUsecaseContract<R, C, ACC> {
  getAccessControlContext(r: any, context: any): any {
    return {} as any;
  }
}

const NOT_AUTHORIZED_MESSAGE = 'UnauthorizedUserException';

function isAuthorizationError(err: Error): boolean {
  return err.message === NOT_AUTHORIZED_MESSAGE;
}

const GenericAuthorize = (accessControl: AccessControlPlus) => {
  return <R, C extends AuthorizationContext>(action: string) => (
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

      const permission = await accessControl.can(
        roles,
        action,
        accessControlContext
      );

      if (!permission.granted) {
        return left(new Error(NOT_AUTHORIZED_MESSAGE));
      }

      const result = await method.call(this, request, context, permission);

      return result;
    };

    return propertyDescriptor;
  };
};

// const Authorize = <R, C extends AuthorizationContext>(action: string) => (
//   _target: AccessControlledUsecase<R, C, AccessControlContext>, // Class of the decorated method
//   _propertyName: string, // method name
//   propertyDescriptor: PropertyDescriptor
// ): PropertyDescriptor => {
//   const method = propertyDescriptor.value;
//   propertyDescriptor.value = async function (request: R, context: C) {
//     const { roles } = context;
//     const accessControlContext = await (_target as any).getAccessControlContext(
//       request,
//       context,
//       {} as AccessControlContext
//     );

//     const permission = await accessControl.can(
//       roles,
//       action,
//       accessControlContext
//     );

//     if (!permission.granted) {
//       return left(new Error('UnauthorizedUserException'));
//     }

//     const result = await method.call(this, request, context, permission);

//     return result;
//   };

//   return propertyDescriptor;
// };

const Authorize = GenericAuthorize(accessControl);

export type {
  Authorization,
  AuthorizationContext,
  AccessControlledUsecaseContract,
};
export {
  AccessControlledUsecase,
  AccessControlContext,
  isAuthorizationError,
  GenericAuthorize,
  Authorize,
};
