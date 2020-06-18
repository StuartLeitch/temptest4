import { expect } from 'chai';
import { Given, When, Then, Before, After } from 'cucumber';

import { Roles } from '../../../src/lib/modules/users/domain/enums/Roles';
import {
  accessControl,
  AccessControlContext,
} from '../../../src/lib/domain/authorization';

// const feature = loadFeature('../../features/authorization/invoices.feature', {
//   loadRelativePath: true,
// });

// const systemRoles = Object.values(Roles);
// const filterAllowedRoles = row => systemRoles.filter(role => row[role].toLowerCase() === 'y');
// const getUsecaseRoles = usecase => (usecase.execute as any).allowedRoles;

const context: AccessControlContext = {};

let roles: string[];
let actionResource: string = null;

async function checkAccessControl(actionOutcome: string) {
  const permission = await accessControl.can(roles, actionResource, context);
  expect(!!permission.granted).to.equal(actionOutcome === 'allowed');
}

// Scenario Outline: Create Invoice (as Owner)
Given('A Transaction that I own', async function () {
  context.entityOwnerId = 'user-1';
  context.userId = 'user-1';
});

When(/I try to ([\w-]+) an Invoice as (.+)/, async function (
  action: string,
  role: string
) {
  actionResource = 'invoice:' + action;
  roles = [Roles[role]];
});

Then(/^I should be (.+)/, async (actionOutcome: string) => {
  await checkAccessControl(actionOutcome);
});

//Scenario Outline: Create Invoice (as Tenant)

// Given("A Transaction that I don't own", async function () {
//   context.entityOwnerId = 'user-2';
//   context.userId = 'user-1';
// });

// Given(/^Transaction is from my Tenant$/, async function () {
//   context.entityOwnerId = 'user-2';
//   context.userId = 'user-1';
// });

//   test('Create Invoice (as Tenant)', ({ given, when, then }) => {
//     given("A Transaction that I don't own", () => {
//       context.entityOwnerId = 'user-2';
//       context.userId = 'user-1';
//     });

//     given('Transaction is from my Tenant', () => {
//       context.entityTenantId = 'tenant-1';
//       context.userTenantId = 'tenant-1';
//     });

//     when(/I try to create an Invoice as (.+)/, (role) => {
//       roles = [Roles[role]];
//     });

//     thenExpect(then, 'invoice:create');
//   });

//   test('Create Invoice (as different Tenant)', ({ given, when, then }) => {
//     given("A Transaction that I don't own", () => {
//       context.entityOwnerId = 'user-2';
//       context.userId = 'user-1';
//     });

//     given('Transaction is from another Tenant', () => {
//       context.entityTenantId = 'tenant-2';
//       context.userTenantId = 'tenant-1';
//     });

//     when(/I try to create an Invoice as (.+)/, (role) => {
//       roles = [Roles[role]];
//     });

//     thenExpect(then, 'invoice:create');
//   });

//   test('Delete Invoice (as Tenant)', ({ given, when, then }) => {
//     given('An Invoice from my Tenant', () => {
//       context.entityTenantId = 'tenant-1';
//       context.userTenantId = 'tenant-1';
//     });

//     when(/I try to delete an Invoice as (.+)/, (role) => {
//       roles = [Roles[role]];
//     });

//     thenExpect(then, 'invoice:delete');
//   });

//   test('Delete Invoice (as different Tenant)', ({ given, when, then }) => {
//     given('An Invoice from my Tenant', () => {
//       context.entityTenantId = 'tenant-2';
//       context.userTenantId = 'tenant-1';
//     });

//     when(/I try to delete an Invoice as (.+)/, (role) => {
//       roles = [Roles[role]];
//     });

//     thenExpect(then, 'invoice:delete');
//   });
// });
