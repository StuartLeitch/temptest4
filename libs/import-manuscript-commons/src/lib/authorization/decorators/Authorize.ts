import { GenericAuthorize } from '@hindawi/shared';

import { accessControl } from '../AccessControl';

const Authorize = GenericAuthorize(accessControl);

export { Authorize };
