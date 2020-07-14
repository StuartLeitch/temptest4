import {
  Authorize,
  AccessControlledUsecase,
  AuthorizationContext,
  AccessControlContext,
} from '../../../../domain/authorization';
import { Roles } from '../../../users/domain/enums/Roles';

export { Authorize, Roles, AccessControlledUsecase, AccessControlContext };
export type CreateCreditNoteAuthorizationContext = AuthorizationContext<Roles>;
