import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { Amount } from '../../../../domain/Amount';
import { Email } from '../../../../domain/Email';

import { PaymentMethodId } from '../../../payments/domain/PaymentMethodId';
import { TransactionId } from '../../../transactions/domain/TransactionId';
import { InvoiceItemProps, InvoiceItem } from '../../domain/InvoiceItem';
import { AddressId } from '../../../addresses/domain/AddressId';
import { CouponCode } from '../../../coupons/domain/CouponCode';
import { PayerType, Payer } from '../../../payers/domain/Payer';
import { PayerTitle } from '../../../payers/domain/PayerTitle';
import { Article } from '../../../manuscripts/domain/Article';
import { InvoiceStatus, Invoice } from '../../domain/Invoice';
import { PayerName } from '../../../payers/domain/PayerName';
import { InvoiceItemId } from '../../domain/InvoiceItemId';
import { Payment } from '../../../payments/domain/Payment';
import { ManuscriptId } from '../../domain/ManuscriptId';
import { PayerId } from '../../../payers/domain/PayerId';
import { InvoiceId } from '../../domain/InvoiceId';
import {
  CouponStatus,
  CouponProps,
  CouponType,
  Coupon,
} from '../../../coupons/domain/Coupon';
import {
  WaiverProps,
  WaiverType,
  Waiver,
} from '../../../waivers/domain/Waiver';

import { MockArticleRepo } from '../../../manuscripts/repos/mocks/mockArticleRepo';
import { MockPaymentRepo } from '../../../payments/repos/mocks/mockPaymentRepo';
import { MockCouponRepo } from '../../../coupons/repos/mocks/mockCouponRepo';
import { MockWaiverRepo } from '../../../waivers/repos/mocks/mockWaiverRepo';
import { MockInvoiceItemRepo } from '../../repos/mocks/mockInvoiceItemRepo';
import { MockPayerRepo } from '../../../payers/repos/mocks/mockPayerRepo';
import { MockInvoiceRepo } from '../../repos/mocks/mockInvoiceRepo';

export function addInvoices(invoicesRepo: MockInvoiceRepo) {
  const invoicesProps = [
    {
      status: InvoiceStatus.FINAL,
      transactionId: TransactionId.create(new UniqueEntityID('1')),
      charge: 100,
      dateAccepted: new Date('2019-10-13'),
      dateCreated: new Date('2018-12-15'),
      dateIssued: new Date('2019-11-01'),
      dateUpdated: new Date('2019-12-01'),
      id: '1',
    },
    {
      status: InvoiceStatus.DRAFT,
      transactionId: TransactionId.create(new UniqueEntityID('2')),
      charge: 150,
      dateCreated: new Date('2018-12-15'),
      dateUpdated: new Date('2018-12-15'),
      id: '2',
    },
    {
      status: InvoiceStatus.ACTIVE,
      transactionId: TransactionId.create(new UniqueEntityID('1')),
      charge: 20,
      dateAccepted: new Date('2019-10-13'),
      dateCreated: new Date('2018-12-15'),
      dateIssued: new Date('2019-11-01'),
      dateUpdated: new Date('2019-11-01'),
      id: '3',
    },
    {
      status: InvoiceStatus.PENDING,
      transactionId: TransactionId.create(new UniqueEntityID('1')),
      charge: 70,
      dateAccepted: new Date('2019-10-13'),
      dateCreated: new Date('2018-12-15'),
      dateIssued: new Date('2019-11-01'),
      dateUpdated: new Date('2019-11-01'),
      id: '4',
    },
    {
      status: InvoiceStatus.DRAFT,
      transactionId: TransactionId.create(new UniqueEntityID('1')),
      charge: 80,
      dateAccepted: new Date('2019-10-13'),
      dateCreated: new Date('2018-12-15'),
      dateUpdated: new Date('2019-10-13'),
      id: '5',
    },
  ];

  for (const props of invoicesProps) {
    const invoice = Invoice.create(
      props,
      new UniqueEntityID(props.id)
    ).getValue();
    invoicesRepo.addMockItem(invoice);
  }
}

export function addInvoiceItems(invoiceItemRepo: MockInvoiceItemRepo) {
  interface InvoiceItemsPropsWithId extends InvoiceItemProps {
    id: string;
  }

  const invoiceItemsProps: InvoiceItemsPropsWithId[] = [
    {
      invoiceId: InvoiceId.create(new UniqueEntityID('1')).getValue(),
      manuscriptId: ManuscriptId.create(new UniqueEntityID('1')).getValue(),
      type: 'APC',
      dateCreated: new Date(),
      id: '1',
    },
    {
      invoiceId: InvoiceId.create(new UniqueEntityID('2')).getValue(),
      manuscriptId: ManuscriptId.create(new UniqueEntityID('2')).getValue(),
      type: 'APC',
      dateCreated: new Date(),
      id: '2',
    },
    {
      invoiceId: InvoiceId.create(new UniqueEntityID('3')).getValue(),
      manuscriptId: ManuscriptId.create(new UniqueEntityID('3')).getValue(),
      type: 'APC',
      dateCreated: new Date(),
      id: '3',
    },
    {
      invoiceId: InvoiceId.create(new UniqueEntityID('4')).getValue(),
      manuscriptId: ManuscriptId.create(new UniqueEntityID('4')).getValue(),
      type: 'APC',
      dateCreated: new Date(),
      id: '4',
    },
    {
      invoiceId: InvoiceId.create(new UniqueEntityID('5')).getValue(),
      manuscriptId: ManuscriptId.create(new UniqueEntityID('5')).getValue(),
      type: 'APC',
      dateCreated: new Date(),
      id: '5',
    },
  ];

  for (const props of invoiceItemsProps) {
    const invoiceItem = InvoiceItem.create(
      props,
      new UniqueEntityID(props.id)
    ).getValue();
    invoiceItemRepo.addMockItem(invoiceItem);
  }
}

export function addManuscripts(manuscriptRepo: MockArticleRepo) {
  const manuscriptsProps = [
    {
      journalId: '1',
      customId: '1',
      title: 'Test 1',
      articleType: '1',
      created: new Date(),
      id: '1',
    },
    {
      journalId: '2',
      customId: '2',
      title: 'Test 2',
      articleType: '2',
      created: new Date(),
      id: '2',
    },
    {
      journalId: '3',
      customId: '3',
      title: 'Test 3',
      articleType: '3',
      created: new Date(),
      id: '3',
    },
    {
      journalId: '4',
      customId: '4',
      title: 'Test 4',
      articleType: '4',
      created: new Date(),
      id: '4',
    },
    {
      journalId: '5',
      customId: '5',
      title: 'Test 5',
      articleType: '5',
      created: new Date(),
      id: '5',
    },
  ];

  for (const props of manuscriptsProps) {
    const manuscript = Article.create(
      props,
      new UniqueEntityID(props.id)
    ).getValue();
    manuscriptRepo.addMockItem(manuscript);
  }
}

export function addPayers(payerRepo: MockPayerRepo) {
  const payersProps = [
    {
      type: PayerType.INDIVIDUAL,
      name: PayerName.create('Test1').getValue(),
      invoiceId: InvoiceId.create(new UniqueEntityID('1')).getValue(),
      title: PayerTitle.create('Mr').getValue(),
      billingAddressId: AddressId.create(new UniqueEntityID('1')),
      email: Email.create({ value: 'test@test.com' }).getValue(),
      id: '1',
    },
    {
      type: PayerType.INDIVIDUAL,
      name: PayerName.create('Test3').getValue(),
      invoiceId: InvoiceId.create(new UniqueEntityID('3')).getValue(),
      title: PayerTitle.create('Mr').getValue(),
      billingAddressId: AddressId.create(new UniqueEntityID('3')),
      email: Email.create({ value: 'test@test.com' }).getValue(),
      id: '3',
    },
  ];

  for (const props of payersProps) {
    const payer = Payer.create(props, new UniqueEntityID(props.id)).getValue();
    payerRepo.addMockItem(payer);
  }
}

export function addPayments(paymentRepo: MockPaymentRepo) {
  const paymentsProps = [
    {
      invoiceId: InvoiceId.create(new UniqueEntityID('1')).getValue(),
      payerId: PayerId.create(new UniqueEntityID('1')),
      amount: Amount.create(100).getValue(),
      paymentMethodId: PaymentMethodId.create(),
      foreignPaymentId: 'test',
      datePaid: new Date('2019-11-20'),
    },
  ];

  for (const props of paymentsProps) {
    const payment = Payment.create(props).getValue();
    paymentRepo.addMockItem(payment);
  }
}

export type CouponPropsForItem = CouponProps & {
  id: string;
  invoiceItemId?: string;
};

export function addCoupons(couponRepo: MockCouponRepo) {
  const couponsProps: CouponPropsForItem[] = [
    {
      code: CouponCode.create('123456').getValue(),
      couponType: CouponType.MULTIPLE_USE,
      status: CouponStatus.ACTIVE,
      dateCreated: new Date(),
      dateUpdated: new Date(),
      invoiceItemType: 'APC',
      invoiceItemId: '1',
      name: 'test 1',
      redeemCount: 0,
      reduction: 10,
      id: '1',
    },
  ];

  for (const couponProps of couponsProps) {
    const coupon = Coupon.create(
      couponProps,
      new UniqueEntityID(couponProps.id)
    ).getValue();

    if (couponProps.invoiceItemId) {
      const invoiceItemId = InvoiceItemId.create(
        new UniqueEntityID(couponProps.invoiceItemId)
      );
      couponRepo.addMockCouponToInvoiceItem(coupon, invoiceItemId);
    } else {
      couponRepo.addMockItem(coupon);
    }
  }
}

export type WaiverPropsForItem = WaiverProps & {
  id: string;
  invoiceItemId?: string;
};

export function addWaivers(waiverRepo: MockWaiverRepo) {
  const waiversProps: WaiverPropsForItem[] = [
    {
      waiverType: WaiverType.EDITOR_DISCOUNT,
      invoiceItemId: '1',
      isActive: true,
      reduction: 10,
      id: '1',
    },
  ];

  for (const waiverProps of waiversProps) {
    const waiver = Waiver.create(
      waiverProps,
      new UniqueEntityID(waiverProps.id)
    ).getValue();

    if (waiverProps.invoiceItemId) {
      const invoiceItemId = InvoiceItemId.create(
        new UniqueEntityID(waiverProps.invoiceItemId)
      );
      waiverRepo.addMockWaiverForInvoiceItem(waiver, invoiceItemId);
    } else {
      waiverRepo.addMockItem(waiver);
    }
  }
}
