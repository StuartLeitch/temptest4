import { Roles } from '../../modules/users/domain/enums/Roles';
import { accessControl } from './AccessControl';
import {
  AccessControlledUsecase,
  isAuthorizationError,
  Authorize,
} from './decorators/Authorize';

import type { AccessControlContext } from './AccessControlContext';
import type { AuthorizationContext } from './decorators/Authorize';

export type UsecaseAuthorizationContext = AuthorizationContext<Roles>;
export {
  AccessControlledUsecase,
  AccessControlContext,
  AuthorizationContext,
  isAuthorizationError,
  accessControl,
  Authorize,
  Roles,
};
export * from './graphql';
