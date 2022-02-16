import { AuthorizationContext } from '@hindawi/shared';

import { Authorize } from './decorators/Authorize';
import { accessControl } from './AccessControl';
import { Roles } from './Roles';

export { accessControl, Authorize, Roles };

export type UsecaseAuthorizationContext = AuthorizationContext<Roles>;
