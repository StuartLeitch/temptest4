import {
  Authorize,
  AccessControlledUsecase,
  AuthorizationContext,
  AccessControlContext,
} from '../../../../domain/authorization/context';
import { Roles } from '../../../users/domain/enums/Roles';

export { Authorize, Roles, AccessControlledUsecase, AccessControlContext };

export type GetRecentInvoicesAuthenticationContext = AuthorizationContext<
  Roles
>;
