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

// * Deny everything to Roles.PUBLIC
accessControl.deny(Roles.PUBLIC).resource('*').action('*');

// * Grant full access to Roles.SUPER_ADMIN
accessControl.grant(Roles.SUPER_ADMIN).resource('*').action('*');

// * Grant full access to Roles.DOMAIN_EVENT_HANDLER
accessControl.grant(Roles.DOMAIN_EVENT_HANDLER).resource('*').action('*');

accessControl
  .grant(Roles.PAYER)
  .resource('invoice')
  .action('update')
  .action('read')
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
  .resource('creditNotes')
  .action('read')
  .resource('creditNote')
  .action('create')
  .action('read')
  .resource('transaction')
  .action('read')
  .resource('journal')
  .action('read')
  .resource('journals')
  .action('read')
  .resource('logs')
  .action('read')
  .resource('publishers')
  .action('read');

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
  .action('validate')
  .resource('logs')
  .action('read');

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
  .action('read')
  .resource('logs')
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
  .resource('creditNotes')
  .action('read')
  .resource('creditNote')
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

accessControl
  .grant(Roles.FINANCIAL_BASIC)
  .resource('invoices')
  .action('read')
  .resource('invoice')
  .action('read')
  .action('readByCustomId')
  .resource('coupons')
  .action('read')
  .resource('coupon')
  .action('read')
  .resource('payment')
  .action('read')
  .resource('paymentMethods')
  .action('read')
  .resource('paymentMethod')
  .action('read')
  .resource('payer')
  .action('read')
  .resource('address')
  .action('read')
  .resource('payments')
  .action('read')
  .resource('creditNotes')
  .action('read')
  .resource('creditNote')
  .action('read')
  .resource('reminder')
  .action('read')
  .resource('manuscript')
  .action('read')
  .resource('journals')
  .action('read')
  .resource('transaction')
  .action('read')
  .resource('payments')
  .action('read')
  .resource('payer')
  .action('read')
  .resource('address')
  .action('read')
  .resource('waiver')
  .action('read')
  .resource('logs')
  .action('read');

accessControl
  .grant(Roles.FINANCIAL_CONTROLLER)
  .inherits(Roles.FINANCIAL_BASIC)
  .resource('invoice')
  .action('create')
  .action('update')
  .action('delete')
  .action('restore')
  .action('confirm')
  .action('applyVAT')
  .resource('address')
  .action('create')
  .resource('payer')
  .action('create')
  .resource('coupon')
  // * Allow coupon creation
  .action('create')
  // * Allow coupon apply
  .action('apply')
  // * Allow coupon edit
  .action('update')
  .action('generateCode')
  // * Allow payment registration
  .resource('payment')
  .action('register')
  .where(paymentIsBankTransfer)
  .action('create')
  .action('update')
  // * Allow credit note creation
  .resource('creditNote')
  .action('create')
  // * Allow toggle reminders
  .resource('reminder')
  .action('toggle')
  .action('send')
  .action('add')
  .resource('manuscript')
  .action('create')
  .resource('logs')
  .action('read');

accessControl
  .grant(Roles.FINANCIAL_ADMIN)
  .inherits(Roles.FINANCIAL_BASIC)
  .resource('invoice')
  .action('update')
  .action('confirm')
  .action('applyVAT')
  .resource('address')
  .action('create')
  .resource('payer')
  .action('create')
  .resource('coupon')
  // * Allow coupon apply
  .action('apply')
  // * Allow credit note creation
  .resource('creditNote')
  .action('create')
  // * Allow toggle reminders
  .resource('reminder')
  .action('toggle')
  .action('send')
  .action('add')
  // * Allow payment registration
  .resource('payment')
  .action('register')
  .where(paymentIsBankTransfer)
  .action('create')
  .action('update')
  .resource('logs')
  .action('read');

accessControl
  .grant(Roles.FINANCIAL_SUPPORT)
  .inherits(Roles.FINANCIAL_BASIC)
  .resource('invoice')
  .action('update')
  .action('confirm')
  .action('applyVAT')
  .resource('address')
  .action('create')
  .resource('payer')
  .action('create')
  .resource('coupon')
  // * Allow coupon apply
  .action('apply')
  .action('generateCode')
  .resource('logs')
  .action('read');

accessControl
  .grant(Roles.MARKETING)
  .inherits(Roles.FINANCIAL_BASIC)
  .resource('invoice')
  .action('update')
  .action('confirm')
  .action('applyVAT')
  .resource('address')
  .action('create')
  .resource('payer')
  .action('create')
  .resource('coupon')
  // * Allow coupon creation
  .action('create')
  // * Allow coupon apply
  .action('apply')
  // * Allow coupon edit
  .action('update')
  .action('generateCode')
  .resource('logs')
  .action('read');

export { accessControl };
