import { expect } from 'chai';
import { Given, When, Then } from 'cucumber';

import { Roles } from '../../../src/lib/modules/users/domain/enums/Roles';
import {
  accessControl,
  AccessControlContext,
} from '../../../src/lib/domain/authorization';

const context: AccessControlContext = {};

let roles: string[];
let actionResource: string = null;

Given('A Transaction that I own', async function () {
  context.entityOwnerId = 'user-1';
  context.userId = 'user-1';
});

Given("A Transaction that I don't own", async function () {
  context.entityOwnerId = 'user-2';
  context.userId = 'user-1';
});

Given('Transaction is from my Tenant', async function () {
  context.entityTenantId = 'tenant-1';
  context.userTenantId = 'tenant-1';
});

Given('Transaction is from another Tenant', async function () {
  context.entityTenantId = 'tenant-2';
  context.userTenantId = 'tenant-1';
});

Given('An Invoice from my Tenant', async function () {
  context.entityTenantId = 'tenant-1';
  context.userTenantId = 'tenant-1';
});

Given('An Invoice from another Tenant', async function () {
  context.entityTenantId = 'tenant-2';
  context.userTenantId = 'tenant-1';
});

When(/I try to ([\w-]+) an Invoice as (.+)/, async function (
  action: string,
  role: string
) {
  actionResource = 'invoice:' + action;
  roles = [Roles[role]];
});

Then(/^I should be (.+)/, async (actionOutcome: string) => {
  const permission = await accessControl.can(roles, actionResource, context);
  expect(!!permission.granted).to.equal(actionOutcome === 'allowed');
});
