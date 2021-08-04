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

accessControl.deny(Roles.PUBLIC).resource('*').action('*');
accessControl
  .grant(Roles.PAYER)
  .resource('invoice')
  .action('update')
  .action('read')
  .resource('creditNote')
  .action('read')
  .resource('creditNote')
  .action('create')
  .action('applyVAT')
  .action('confirm')
  .action('getPDF')
  .resource('payer')
  .action('create')
  .action('read')
  .resource('address')
  .action('read')
  .action('create')
  .resource('payment')
  .action('register')
  .where(paymentIsPaypalOrCreditCard)
  .action('update')
  .action('create')
  .action('read')
  .action('generateToken')
  .resource('manuscript')
  .action('read')
  .resource('payments')
  .action('read')
  .resource('paymentMethods')
  .action('read')
  .resource('paymentMethod')
  .action('read')
  .resource('transaction')
  .action('read')
  .resource('coupon')
  .action('apply')
  .resource('waiver')
  .action('read')
  .resource('VAT')
  .action('validate')
  .resource('journal')
  .action('read');
accessControl
  .grant(Roles.ADMIN)
  .resource('payment')
  .action('register')
  .where(paymentIsBankTransfer)
  .action('read')
  .action('create')
  .resource('payments')
  .action('read')
  .resource('paymentMethod')
  .action('read')
  .resource('paymentMethods')
  .action('read')
  .resource('manuscript')
  .action('read')
  .resource('reminder')
  .action('toggle')
  .action('read')
  .action('add')
  .resource('coupon')
  .action('generateCode')
  .action('read')
  .action('create')
  .action('update')
  .action('apply')
  .resource('coupons')
  .action('read')
  .resource('invoices')
  .action('read')
  .resource('payer')
  .action('create')
  .action('read')
  .resource('invoice')
  .action('readByCustomId')
  .action('read')
  .action('update')
  .action('confirm')
  .action('applyVAT')
  .resource('address')
  .action('create')
  .resource('creditNote')
  .action('create')
  .action('read')
  .resource('transaction')
  .action('read')
  .resource('journal')
  .action('read')
  .resource('journals')
  .action('read');
accessControl.grant(Roles.SUPER_ADMIN).resource('*').action('*');
accessControl
  .grant(Roles.QUEUE_EVENT_HANDLER)
  .resource('invoice')
  .action('read')
  .action('create')
  .action('update')
  .action('delete')
  .action('restore')
  .action('readByCustomId')
  .action('confirm')
  .action('applyVAT')
  .resource('transaction')
  .action('create')
  .action('read')
  .action('update')
  .action('delete')
  .action('restore')
  .resource('payer')
  .action('create')
  .action('read')
  .action('update')
  .resource('manuscript')
  .action('create')
  .action('read')
  .action('update')
  .action('delete')
  .action('restore')
  .resource('journal')
  .action('create')
  .action('read')
  .action('update')
  .resource('editor')
  .action('create')
  .action('update')
  .action('delete')
  .action('read')
  .action('assign')
  .resource('address')
  .action('read')
  .action('create')
  .resource('coupon')
  .action('read')
  .resource('waiver')
  .action('read')
  .resource('VAT')
  .action('validate');
accessControl.grant(Roles.DOMAIN_EVENT_HANDLER).resource('*').action('*');
accessControl
  .grant(Roles.SERVICE)
  .resource('payments')
  .action('read')
  .resource('invoice')
  .action('migrate')
  .action('read')
  .action('generateCompensatoryEvents')
  .action('createReminders')
  .resource('invoices')
  .action('read')
  .resource('creditNote')
  .action('read')
  .action('generateCompensatoryEvents')
  .resource('payment')
  .action('read')
  .resource('payer')
  .action('read')
  .resource('address')
  .action('read')
  .resource('manuscript')
  .action('read')
  .resource('transaction')
  .action('read')
  .resource('paymentMethod')
  .action('read')
  .resource('paymentMethods')
  .action('read');
accessControl
  .grant(Roles.CHRON_JOB)
  .resource('erp')
  .action('read')
  .action('create')
  .action('update')
  .action('publish')
  .resource('reminder')
  .action('send')
  .action('read')
  .action('add')
  .resource('invoice')
  .action('read')
  .resource('payment')
  .action('read')
  .resource('payer')
  .action('read')
  .resource('address')
  .action('read')
  .resource('manuscript')
  .action('read')
  .resource('transaction')
  .action('read')
  .action('activate')
  .action('update')
  .resource('paymentMethod')
  .action('read')
  .resource('paymentMethods')
  .action('read')
  .resource('journal')
  .action('read');

export { accessControl };
