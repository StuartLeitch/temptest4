import {defineFeature, loadFeature} from 'jest-cucumber';

import {Roles} from '../../../lib/modules/users/domain/enums/Roles';
import {
  accessControl,
  AccessControlContext
} from '../../../lib/domain/authorization';

const feature = loadFeature('./specs/features/authorization/invoices.feature');

// const systemRoles = Object.values(Roles);
// const filterAllowedRoles = row => systemRoles.filter(role => row[role].toLowerCase() === 'y');
// const getUsecaseRoles = usecase => (usecase.execute as any).allowedRoles;

defineFeature(feature, test => {
  let context: AccessControlContext = {};
  let roles: string[];

  function thenExpect(then: Function, actionResource: any) {
    then(/^I should be (allowed|denied)$/, async (action: string) => {
      const permission = await accessControl.can(
        roles,
        actionResource,
        context
      );
      expect({
        roles,
        actionResource,
        granted: !!permission.granted
      }).toEqual({
        roles,
        actionResource,
        granted: action === 'allowed'
      });
    });
  }

  test('Create Invoice (as Owner)', ({given, when, then}) => {
    given('A Transaction that I own', () => {
      context.entityOwnerId = 'user-1';
      context.userId = 'user-1';
    });

    when(/I try to create an Invoice as (.+)/, role => {
      roles = [Roles[role]];
    });

    thenExpect(then, 'invoice:create');
  });

  test('Create Invoice (as Tenant)', ({given, when, then}) => {
    given("A Transaction that I don't own", () => {
      context.entityOwnerId = 'user-2';
      context.userId = 'user-1';
    });

    given('Transaction is from my Tenant', () => {
      context.entityTenantId = 'tenant-1';
      context.userTenantId = 'tenant-1';
    });

    when(/I try to create an Invoice as (.+)/, role => {
      roles = [Roles[role]];
    });

    thenExpect(then, 'invoice:create');
  });

  test('Create Invoice (as different Tenant)', ({given, when, then}) => {
    given("A Transaction that I don't own", () => {
      context.entityOwnerId = 'user-2';
      context.userId = 'user-1';
    });

    given('Transaction is from another Tenant', () => {
      context.entityTenantId = 'tenant-2';
      context.userTenantId = 'tenant-1';
    });

    when(/I try to create an Invoice as (.+)/, role => {
      roles = [Roles[role]];
    });

    thenExpect(then, 'invoice:create');
  });

  test('Delete Invoice (as Tenant)', ({given, when, then}) => {
    given('An Invoice from my Tenant', () => {
      context.entityTenantId = 'tenant-1';
      context.userTenantId = 'tenant-1';
    });

    when(/I try to delete an Invoice as (.+)/, role => {
      roles = [Roles[role]];
    });

    thenExpect(then, 'invoice:delete');
  });

  test('Delete Invoice (as different Tenant)', ({given, when, then}) => {
    given('An Invoice from my Tenant', () => {
      context.entityTenantId = 'tenant-2';
      context.userTenantId = 'tenant-1';
    });

    when(/I try to delete an Invoice as (.+)/, role => {
      roles = [Roles[role]];
    });

    thenExpect(then, 'invoice:delete');
  });
});
