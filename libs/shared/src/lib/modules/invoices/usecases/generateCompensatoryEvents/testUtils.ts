import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';

import { InvoiceItemId } from '../../domain/InvoiceItemId';

import { PaymentMethod } from '../../../payments/domain/PaymentMethod';

import { ArticleMap } from '../../../manuscripts/mappers/ArticleMap';
import { CouponMap } from '../../../coupons/mappers/CouponMap';
import { WaiverMap } from '../../../waivers/mappers/WaiverMap';
import { InvoiceItemMap } from '../../mappers/InvoiceItemMap';
import { PaymentMap } from '../../../payments/mapper/Payment';
import { PayerMap } from '../../../payers/mapper/Payer';
import { InvoiceMap } from '../../mappers/InvoiceMap';

import { MockPaymentMethodRepo } from '../../../payments/repos/mocks/mockPaymentMethodRepo';
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
      dateAccepted: '2019-10-13',
      dateCreated: '2018-12-15',
      dateUpdated: '2019-12-01',
      dateIssued: '2019-11-01',
      transactionId: '1',
      status: 'FINAL',
      charge: 100,
      id: '1',
    },
    {
      dateCreated: '2018-12-15',
      dateUpdated: '2018-12-15',
      transactionId: '2',
      status: 'DRAFT',
      charge: 150,
      id: '2',
    },
    {
      dateAccepted: '2019-10-13',
      dateCreated: '2018-12-15',
      dateUpdated: '2019-11-01',
      dateIssued: '2019-11-01',
      transactionId: '3',
      status: 'ACTIVE',
      charge: 20,
      id: '3',
    },
    {
      dateAccepted: '2019-10-13',
      dateCreated: '2018-12-15',
      dateUpdated: '2019-11-01',
      dateIssued: '2019-11-01',
      transactionId: '4',
      status: 'PENDING',
      charge: 70,
      id: '4',
    },
    {
      dateAccepted: '2019-10-13',
      dateCreated: '2018-12-15',
      dateUpdated: '2019-10-13',
      transactionId: '5',
      status: 'DRAFT',
      charge: 80,
      id: '5',
    },
  ];

  for (const props of invoicesProps) {
    const invoice = InvoiceMap.toDomain(props);
    invoice.props.dateUpdated = new Date(props.dateUpdated);
    invoicesRepo.addMockItem(invoice);
  }
}

export function addInvoiceItems(invoiceItemRepo: MockInvoiceItemRepo) {
  const invoiceItemsProps = [
    {
      manuscriptId: '1',
      invoiceId: '1',
      id: '1',
    },
    {
      manuscriptId: '2',
      invoiceId: '2',
      id: '2',
    },
    {
      manuscriptId: '3',
      invoiceId: '3',
      id: '3',
    },
    {
      manuscriptId: '4',
      invoiceId: '4',
      id: '4',
    },
    {
      manuscriptId: '5',
      invoiceId: '5',
      id: '5',
    },
  ];

  for (const props of invoiceItemsProps) {
    const invoiceItem = InvoiceItemMap.toDomain(props);
    invoiceItemRepo.addMockItem(invoiceItem);
  }
}

export function addManuscripts(manuscriptRepo: MockArticleRepo) {
  const manuscriptsProps = [
    {
      created: new Date(),
      articleType: '1',
      title: 'Test 1',
      journalId: '1',
      customId: '1',
      id: '1',
    },
    {
      created: new Date(),
      articleType: '2',
      title: 'Test 2',
      journalId: '2',
      customId: '2',
      id: '2',
    },
    {
      created: new Date(),
      articleType: '3',
      title: 'Test 3',
      journalId: '3',
      customId: '3',
      id: '3',
    },
    {
      created: new Date(),
      articleType: '4',
      title: 'Test 4',
      journalId: '4',
      customId: '4',
      id: '4',
    },
    {
      created: new Date(),
      articleType: '5',
      title: 'Test 5',
      journalId: '5',
      customId: '5',
      id: '5',
    },
  ];

  for (const props of manuscriptsProps) {
    const manuscript = ArticleMap.toDomain(props);
    manuscriptRepo.addMockItem(manuscript);
  }
}

export function addPayers(payerRepo: MockPayerRepo) {
  const payersProps = [
    {
      shippingAddressId: '1',
      email: 'test@test.com',
      billingAddressId: '1',
      type: 'INDIVIDUAL',
      invoiceId: '1',
      name: 'Test1',
      title: 'Mr',
      id: '1',
    },
    {
      shippingAddressId: '3',
      email: 'test@test.com',
      billingAddressId: '3',
      type: 'INDIVIDUAL',
      invoiceId: '3',
      name: 'Test3',
      title: 'Mr',
      id: '3',
    },
  ];

  for (const props of payersProps) {
    const payer = PayerMap.toDomain(props);
    payerRepo.addMockItem(payer);
  }
}

export function addPayments(paymentRepo: MockPaymentRepo) {
  const paymentsProps = [
    {
      foreignPaymentId: 'test',
      datePaid: '2019-12-01',
      paymentMethodId: '1',
      invoiceId: '1',
      payerId: '1',
      amount: 100,
    },
  ];

  for (const props of paymentsProps) {
    const payment = PaymentMap.toDomain(props);
    paymentRepo.addMockItem(payment);
  }
}

export function addCoupons(couponRepo: MockCouponRepo) {
  const couponsProps = [
    {
      dateCreated: new Date(),
      dateUpdated: new Date(),
      invoiceItemType: 'APC',
      type: 'MULTIPLE_USE',
      invoiceItemId: '1',
      status: 'ACTIVE',
      code: '123456',
      name: 'test 1',
      redeemCount: 0,
      reduction: 10,
      id: '1',
    },
  ];

  for (const props of couponsProps) {
    const coupon = CouponMap.toDomain(props);

    if (props.invoiceItemId) {
      const invoiceItemId = InvoiceItemId.create(
        new UniqueEntityID(props.invoiceItemId)
      );
      couponRepo.addMockCouponToInvoiceItem(coupon, invoiceItemId);
    } else {
      couponRepo.addMockItem(coupon);
    }
  }
}

export function addWaivers(waiverRepo: MockWaiverRepo) {
  const waiversProps = [
    {
      type_id: 'EDITOR_DISCOUNT',
      invoiceItemId: '1',
      isActive: true,
      reduction: 10,
      id: '1',
    },
  ];

  for (const props of waiversProps) {
    const waiver = WaiverMap.toDomain(props);

    if (props.invoiceItemId) {
      const invoiceItemId = InvoiceItemId.create(
        new UniqueEntityID(props.invoiceItemId)
      );
      waiverRepo.addMockWaiverForInvoiceItem(waiver, invoiceItemId);
    } else {
      waiverRepo.addMockItem(waiver);
    }
  }
}

export function addPaymentMethods(paymentMethodRepo: MockPaymentMethodRepo) {
  const paymentMethodsProps = [
    {
      name: 'Migration',
      isActive: true,
    },
  ];

  for (const props of paymentMethodsProps) {
    const paymentMethod = PaymentMethod.create(props).getValue();
    paymentMethodRepo.addMockItem(paymentMethod);
  }
}
