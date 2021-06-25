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
  .action('read')
  .resource('payer')
  .action('update')
  .resource('payments')
  .action('read')
  .resource('payment')
  .action('create')
  .where(paymentIsPaypalOrCreditCard)
  .resource('payments')
  .action('create')
  .action('update')
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
  .where(paymentIsBankTransfer);
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
  .action('generateCompensatoryEvents');
accessControl.grant(Roles.EVENT_HANDLER).resource('invoice').action('read');
accessControl
  .grant(Roles.SERVICE)
  .resource('payments')
  .action('read')
  .resource('invoice')
  .action('migrate')
  .action('generateCompensatoryEvents');

export { accessControl };
