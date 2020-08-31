import type { AuthorizationContext } from './decorators/Authorize';
import { Authorize, AccessControlledUsecase } from './decorators/Authorize';
import { Roles } from '../../modules/users/domain/enums/Roles';
import type { AccessControlContext } from './AccessControlContext';
import { accessControl } from './AccessControl';

export type UsecaseAuthorizationContext = AuthorizationContext<Roles>;
export {
  Authorize,
  AccessControlledUsecase,
  AuthorizationContext,
  Roles,
  AccessControlContext,
  accessControl,
};
