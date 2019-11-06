import {
  //  Authorize,
  AccessControlledUsecase,
  AuthorizationContext
} from '../../../../../domain/authorization/decorators/Authorize';
import {AccessControlContext} from '../../../../../domain/authorization/AccessControl';
import {Roles} from '../../../../users/domain/enums/Roles';

export {Roles, AccessControlledUsecase, AccessControlContext};
export type CreateJournalAuthorizationContext = AuthorizationContext<Roles>;
