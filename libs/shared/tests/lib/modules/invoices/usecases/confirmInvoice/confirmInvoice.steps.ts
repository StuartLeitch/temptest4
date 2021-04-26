import { expect } from 'chai';
import { Given, When, Then, Before } from '@cucumber/cucumber';
import { spy } from 'sinon';

import { ConfirmInvoiceUsecase } from '../../../../../../src/lib/modules/invoices/usecases/confirmInvoice/confirmInvoice';
// import { ConfirmInvoiceResponse } from '../../../../../../src/lib/modules/invoices/usecases/confirmInvoice/confirmInvoiceResponse'
import { MockInvoiceRepo } from '../../../../../../src/lib/modules/invoices/repos/mocks/mockInvoiceRepo';
import { MockInvoiceItemRepo } from '../../../../../../src/lib/modules/invoices/repos/mocks/mockInvoiceItemRepo';
import { MockAddressRepo } from '../../../../../../src/lib/modules/addresses/repos/mocks/mockAddressRepo';
import { MockArticleRepo } from './../../../../../../src/lib/modules/manuscripts/repos/mocks/mockArticleRepo';
import { MockCouponRepo } from '../../../../../../src/lib/modules/coupons/repos/mocks/mockCouponRepo';
import { MockWaiverRepo } from '../../../../../../src/lib/modules/waivers/repos/mocks/mockWaiverRepo';
import { MockPayerRepo } from '../../../../../../src/lib/modules/payers/repos/mocks/mockPayerRepo';
import { MockErpReferenceRepo } from './../../../../../../src/lib/modules/vendors/repos/mocks/mockErpReferenceRepo';
import { MockLogger } from './../../../../../../src/lib/infrastructure/logging/mocks/MockLogger';
import { InvoiceMap } from './../../../../../../src/lib/modules/invoices/mappers/InvoiceMap';
import { InvoiceId } from '../../../../../../src/lib/modules/invoices/domain/InvoiceId';
import { UniqueEntityID } from '../../../../../../src/lib/core/domain/UniqueEntityID';
import { VATService } from '../../../../../../src/lib/domain/services/VATService';
import {
  InvoiceItemMap,
  PayerInput,
  CouponMap,
  WaiverMap,
  Roles,
  UsecaseAuthorizationContext,
  MockTransactionRepo,
  TransactionMap,
  TransactionId,
  TransactionStatus,
} from '../../../../../../src/lib/shared';
import { ConfirmInvoiceResponse } from '../../../../../../src/lib/modules/invoices/usecases/confirmInvoice/confirmInvoiceResponse';

let mockErpReferenceRepo: MockErpReferenceRepo;
let mockInvoiceItemRepo: MockInvoiceItemRepo;
let mockTransactionRepo: MockTransactionRepo;
let mockInvoiceRepo: MockInvoiceRepo;
let mockAddressRepo: MockAddressRepo;
let mockArticleRepo: MockArticleRepo;
let mockCouponRepo: MockCouponRepo;
let mockWaiverRepo: MockWaiverRepo;
let mockPayerRepo: MockPayerRepo;

let mockLogger: MockLogger;
let mockEmailService: any;

const mockVatService: VATService = new VATService();
// let response: ChangeInvoiceStatusResponse;

let useCase: ConfirmInvoiceUsecase;
let response: ConfirmInvoiceResponse;
const context: UsecaseAuthorizationContext = {
  roles: [Roles.ADMIN],
};

Before(function () {
  const _emailService = {
    createInvoicePendingNotification: () => ({
      sendEmail: () => void 0,
    }),
  };

  mockInvoiceItemRepo = new MockInvoiceItemRepo();
  mockErpReferenceRepo = new MockErpReferenceRepo();
  mockArticleRepo = new MockArticleRepo();
  mockInvoiceRepo = new MockInvoiceRepo(
    mockArticleRepo,
    mockInvoiceItemRepo,
    mockErpReferenceRepo
  );
  mockAddressRepo = new MockAddressRepo();
  mockPayerRepo = new MockPayerRepo();
  mockEmailService = spy(_emailService);
  mockCouponRepo = new MockCouponRepo();
  mockWaiverRepo = new MockWaiverRepo();
  mockLogger = new MockLogger();
  mockTransactionRepo = new MockTransactionRepo();

  useCase = new ConfirmInvoiceUsecase(
    mockInvoiceItemRepo,
    mockTransactionRepo,
    mockAddressRepo,
    mockInvoiceRepo,
    mockCouponRepo,
    mockWaiverRepo,
    mockPayerRepo,
    mockLogger,
    mockEmailService,
    mockVatService
  );
});

Given(
  /^There is an Invoice with the ID "([\w-]+)"$/,
  async function (testInvoiceId: string) {
    const invoice = InvoiceMap.toDomain({
      transactionId: 'transaction-id',
      status: 'DRAFT',
      dateCreated: new Date(),
      id: testInvoiceId,
    });
    const invoiceItem = InvoiceItemMap.toDomain({
      invoiceId: testInvoiceId,
      manuscriptId: '8888',
      price: 100,
    });
    const transaction = TransactionMap.toDomain({
      id: 'transaction-id',
      status: 'ACTIVE',
    });

    await mockInvoiceRepo.save(invoice);
    await mockInvoiceItemRepo.save(invoiceItem);
    await mockTransactionRepo.save(transaction);
  }
);

Given(
  /^There is a fully discounted Invoice with the ID "([\w-]+)"$/,
  async function (testInvoiceId: string) {
    const invoice = InvoiceMap.toDomain({
      transactionId: 'transaction-id',
      status: 'DRAFT',
      dateCreated: new Date(),
      id: testInvoiceId,
    });

    const invoiceItem = InvoiceItemMap.toDomain({
      invoiceId: testInvoiceId,
      manuscriptId: '8888',
      price: 100,
      vat: 0,
    });
    const transaction = TransactionMap.toDomain({
      id: 'transaction-id',
      status: 'ACTIVE',
    });

    await mockInvoiceRepo.save(invoice);
    await mockInvoiceItemRepo.save(invoiceItem);
    await mockTransactionRepo.save(transaction);

    mockCouponRepo.addMockCouponToInvoiceItem(
      CouponMap.toDomain({
        code: 'ASD1123',
        dateCreated: new Date(),
        dateUpdated: new Date(),
        id: 'coup1',
        invoiceItemType: 'APC',
        name: 'coup',
        redeemCount: 1,
        reduction: 50,
        status: 'active',
        type: 'SINGLE_USE',
      }),
      invoiceItem.invoiceItemId
    );

    mockWaiverRepo.addMockWaiverForInvoiceItem(
      WaiverMap.toDomain({
        waiverType: 'EDITOR_DISCOUNT',
        reduction: 50,
        isActive: true,
      }),
      invoiceItem.invoiceItemId
    );
  }
);

Given(/^The transaction has status "([\w]+)"$/, async (status) => {
  const transactionId = TransactionId.create(
    new UniqueEntityID('transaction-id')
  );
  const transaction = await mockTransactionRepo.getTransactionById(
    transactionId
  );

  transaction.props.status = TransactionStatus[status];

  await mockTransactionRepo.update(transaction);
});

When(
  /^The Payer "([\w-]+)" from "([\w-]+)" confirms the invoice with the ID "([\w-]+)"$/,
  async function (payerName: string, payerCountry: string, invoiceId: string) {
    const payerInput: PayerInput = {
      name: payerName,
      invoiceId: invoiceId,
      id: payerName,
      address: {
        country: payerCountry,
      },
    };
    response = await useCase.execute({ payer: payerInput }, context);
  }
);

Then('The result is successful', function () {
  expect(response.isRight()).to.equal(
    true,
    `Expected success, got ${response.value}`
  );
});

Then(
  /^The invoice "([\w-]+)" is successfully updated to status "([\w-]+)"$/,
  async function (invoiceId: string, status: string) {
    const invoice = await mockInvoiceRepo.getInvoiceById(
      InvoiceId.create(new UniqueEntityID(invoiceId)).getValue()
    );
    expect(invoice.status).to.equal(status);
  }
);

Then(
  /^The Payer "([\w-]+)" is saved successfully for the invoice with the ID "([\w-]+)"$/,
  async function (payerName: string, invoiceId: string) {
    const payer = await mockPayerRepo.getPayerByInvoiceId(
      InvoiceId.create(new UniqueEntityID(invoiceId)).getValue()
    );
    expect(payer.name.value).to.equal(payerName);
  }
);

Then(
  /^The Invoice "([\w-]+)" has vat amount greater than (\d+)$/,
  async function (invoiceId: string, vatAmount: number) {
    const id = InvoiceId.create(new UniqueEntityID(invoiceId)).getValue();
    const invoice = await mockInvoiceRepo.getInvoiceById(id);

    invoice.addItems(await mockInvoiceItemRepo.getItemsByInvoiceId(id));
    expect(invoice.invoiceVatTotal).to.be.greaterThan(vatAmount);
  }
);

Then(
  /^The Invoice for "([\w-]+)" is sent by email$/,
  async function (invoiceId: string) {
    expect(
      mockEmailService.createInvoicePendingNotification.callCount
    ).to.equal(1);
  }
);

Then(/^The response is error "([\w]+)"$/, (errorName) => {
  expect(response.isLeft()).to.be.true;
  expect(response.value.constructor.name).to.equal(errorName);
});
