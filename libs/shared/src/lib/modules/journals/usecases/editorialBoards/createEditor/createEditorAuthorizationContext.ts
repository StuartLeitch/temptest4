import {
  AccessControlledUsecase,
  AuthorizationContext,
  AccessControlContext,
  Roles,
} from '../../../../../domain/authorization';

export { Roles, AccessControlledUsecase, AccessControlContext };
export type CreateEditorAuthorizationContext = AuthorizationContext<Roles>;
