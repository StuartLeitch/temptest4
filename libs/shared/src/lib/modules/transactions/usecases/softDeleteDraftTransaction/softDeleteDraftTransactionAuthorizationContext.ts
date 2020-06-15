import {
  Authorize,
  AccessControlledUsecase,
  AuthorizationContext,
  AccessControlContext,
  Roles,
} from '../../../../domain/authorization';

export { Authorize, Roles, AccessControlledUsecase, AccessControlContext };

export type SoftDeleteDraftTransactionAuthorizationContext = AuthorizationContext<
  Roles
>;
