import {
  UniqueEntityID,
  InvoiceItemId,
  PaymentMethodMap,
  ArticleMap,
  AddressMap,
  CouponMap,
  WaiverMap,
  InvoiceItemMap,
  PaymentMap,
  PayerMap,
  InvoiceMap,
  MockPaymentMethodRepo,
  MockArticleRepo,
  MockAddressRepo,
  MockPaymentRepo,
  MockCouponRepo,
  MockWaiverRepo,
  MockInvoiceItemRepo,
  MockPayerRepo,
  MockInvoiceRepo,
} from '@hindawi/shared';

export function addInvoices(invoicesRepo: MockInvoiceRepo) {
  const invoicesProps = [
    {
      dateMovedToFinal: '2019-12-03',
      dateAccepted: '2019-10-13',
      dateCreated: '2018-12-15',
      dateUpdated: '2019-12-03',
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
    {
      dateMovedToFinal: '2019-12-01',
      dateAccepted: '2019-10-13',
      dateCreated: '2018-12-15',
      dateUpdated: '2019-12-01',
      dateIssued: '2019-11-01',
      transactionId: '6',
      status: 'FINAL',
      charge: 80,
      id: '6',
    },
    {
      cancelledInvoiceReference: '6',
      dateMovedToFinal: '2019-12-03',
      dateAccepted: '2019-10-13',
      dateCreated: '2019-12-01',
      dateUpdated: '2019-12-03',
      dateIssued: '2019-12-01',
      transactionId: '6',
      status: 'FINAL',
      charge: 80,
      id: '7',
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
    {
      manuscriptId: '6',
      invoiceId: '6',
      price: 80,
      id: '6',
      vat: 20,
    },
    {
      manuscriptId: '6',
      invoiceId: '7',
      price: -80,
      id: '7',
      vat: 20,
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
    {
      created: new Date(),
      articleType: '6',
      title: 'Test 6',
      journalId: '6',
      customId: '6',
      id: '6',
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
    {
      shippingAddressId: '6',
      email: 'test@test.com',
      billingAddressId: '6',
      type: 'INDIVIDUAL',
      invoiceId: '6',
      name: 'Test6',
      title: 'Mr',
      id: '6',
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
    {
      foreignPaymentId: 'test',
      datePaid: '2019-12-01',
      paymentMethodId: '1',
      invoiceId: '6',
      payerId: '6',
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
      id: '1',
    },
  ];

  for (const props of paymentMethodsProps) {
    const paymentMethod = PaymentMethodMap.toDomain(props);
    paymentMethodRepo.addMockItem(paymentMethod);
  }
}

export function addBillingAddresses(addressRepo: MockAddressRepo) {
  const addressProps = [
    {
      id: '1',
      city: 'City1',
      state: 'State1',
      postalCode: '00567',
      country: 'US',
      addressLine1: 'Test address 1',
    },
    {
      id: '3',
      city: 'City3',
      state: null,
      postalCode: null,
      country: 'RO',
      addressLine1: 'TestAddress3',
    },
    {
      id: '6',
      city: 'City6',
      state: null,
      postalCode: null,
      country: 'RO',
      addressLine1: 'TestAddress6',
    },
  ];

  for (const props of addressProps) {
    const address = AddressMap.toDomain(props);
    addressRepo.addMockItem(address);
  }
}
