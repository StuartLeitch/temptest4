import { AccessControlPlus } from 'accesscontrol-plus';

import { Roles } from './Roles';

const accessControl = new AccessControlPlus();

// * Deny everything to Roles.PUBLIC
accessControl.deny(Roles.PUBLIC).resource('*').action('*');

// * Grant full access to Roles.SUPER_ADMIN
accessControl.grant(Roles.SUPER_ADMIN).resource('*').action('*');

accessControl.grant(Roles.ADMIN).resource('manuscript').action('upload');

accessControl
  .grant(Roles.QUEUE_EVENT_HANDLER)
  .resource('manuscript')
  .action('upload');

accessControl
  .grant(Roles.EDITORIAL_ASSISTANT)
  .resource('manuscript')
  .action('upload');

export { accessControl };
