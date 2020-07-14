import { AccessControlPlus } from 'accesscontrol-plus';

import { Roles } from '../../modules/users/domain/enums/Roles';

export interface AccessControlContext {
  userId?: string;
  userTenantId?: string;
  entityOwnerId?: string;
  entityTenantId?: string;
}

const userOwnsEntity = (context: AccessControlContext): boolean => {
  return context.entityOwnerId === context.userId;
};

const tenantMatches = (context: AccessControlContext): boolean =>
  context.entityTenantId === context.userTenantId;

const accessControl = new AccessControlPlus();

accessControl
  .deny('public')
    .resource('*')
      .action('*')
  .grant(Roles.CUSTOMER)
    .resource('invoice')
      .action('create')
    .where(userOwnsEntity)
  .grant(Roles.PAYER)
    .resource('invoice')
      .action('read')
    .resource('payer')
      .action('update')
    .resource('payments')
      .action('read')
  // .where(userOwnsEntity)
  .grant(Roles.AUTHOR)
    .inherits(Roles.CUSTOMER)
  .grant(Roles.ADMIN)
    .inherits(Roles.CUSTOMER)
    .resource('*')
      .action('*')
    .where(tenantMatches)
  .grant(Roles.SUPER_ADMIN)
    .resource('*')
      .action('*');

export { accessControl };
