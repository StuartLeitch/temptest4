import { AuthorizationContext } from '../../../../domain/authorization/decorators/Authorize';

import { Roles } from '../../../users/domain/enums/Roles';

export type GetCouponDetailsByCodeAuthenticationContext = AuthorizationContext<
  Roles
>;
