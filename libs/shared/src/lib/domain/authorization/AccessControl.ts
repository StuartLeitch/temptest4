import { AccessControlPlus } from 'accesscontrol-plus';

import { PaymentTypes } from '../../modules/payments/domain/Payment';
import { Roles } from '../../modules/users/domain/enums/Roles';

import { AccessControlContext } from './AccessControlContext';

function userOwnsEntity(context: AccessControlContext): boolean {
  return context.entityOwnerId === context.userId;
}

function tenantMatches(context: AccessControlContext): boolean {
  return context.entityTenantId === context.userTenantId;
}

function paymentIsPaypalOrCreditCard(context: AccessControlContext): boolean {
  if (
    context.paymentType === PaymentTypes.CREDIT_CARD ||
    context.paymentType === PaymentTypes.PAYPAL
  ) {
    return true;
  }

  return false;
}

function paymentIsBankTransfer(context: AccessControlContext): boolean {
  if (context.paymentType === PaymentTypes.BANK_TRANSFER) {
    return true;
  }

  return false;
}

const accessControl = new AccessControlPlus();

accessControl.deny('public').resource('*').action('*');
accessControl
  .grant(Roles.CUSTOMER)
  .resource('invoice')
  .action('create')
  .where(userOwnsEntity);
accessControl
  .grant(Roles.PAYER)
  .resource('invoice')
  .action('create')
  .action('read')
  .resource('payer')
  .action('create')
  .action('read')
  .resource('payment')
  .action('create')
  .where(paymentIsPaypalOrCreditCard)
  .action('update')
  .action('read')
  .resource('payments')
  .action('read')
  .resource('transaction')
  .action('read');
accessControl.grant(Roles.AUTHOR).inherits(Roles.CUSTOMER);
accessControl
  .grant(Roles.ADMIN)
  .inherits(Roles.CUSTOMER)
  .resource('*')
  .action('*')
  .resource('payment')
  .action('create')
  .where(paymentIsBankTransfer)
  .resource('reminder')
  .action('toggle')
  .action('read')
  .resource('coupon')
  .action('generateCode')
  .action('read')
  .action('create')
  .action('update')
  .resource('coupons')
  .action('read')
  .resource('invoices')
  .action('read')
  .resource('invoice')
  .action('readByCustomId')
  .action('read');
// .where(tenantMatches);
accessControl
  .grant(Roles.SUPER_ADMIN)
  .resource('*')
  .action('*')
  .resource('payment')
  .action('create')
  .where(paymentIsBankTransfer);
accessControl
  .deny(Roles.SUPER_ADMIN)
  .resource('invoice')
  .action('migrate')
  .action('generateCompensatoryEvents')
  .action('createReminders');
accessControl.grant(Roles.EVENT_HANDLER).resource('invoice').action('read');
accessControl
  .grant(Roles.SERVICE)
  .resource('payments')
  .action('read')
  .resource('invoice')
  .action('migrate')
  .action('generateCompensatoryEvents')
  .action('createReminders');

export { accessControl };
