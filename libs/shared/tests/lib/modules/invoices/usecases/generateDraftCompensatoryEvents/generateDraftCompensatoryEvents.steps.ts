import { Before, Given, When, Then, After } from 'cucumber';
import { expect } from 'chai';

import { UsecaseAuthorizationContext } from '../../../../../../src/lib/domain/authorization';
import { MockLogger } from './../../../../../../src/lib/infrastructure/logging';

import { MockSqsPublishService } from './../../../../../../src/lib/domain/services/SQSPublishService';

import { Roles } from '../../../../../../src/lib/modules/users/domain/enums/Roles';

import { MockPaymentMethodRepo } from './../../../../../../src/lib/modules/payments/repos/mocks/mockPaymentMethodRepo';
import { MockArticleRepo } from './../../../../../../src/lib/modules/manuscripts/repos/mocks/mockArticleRepo';
import { MockAddressRepo } from './../../../../../../src/lib/modules/addresses/repos/mocks/mockAddressRepo';
import { MockPaymentRepo } from './../../../../../../src/lib/modules/payments/repos/mocks/mockPaymentRepo';
import { MockCouponRepo } from './../../../../../../src/lib/modules/coupons/repos/mocks/mockCouponRepo';
import { MockWaiverRepo } from './../../../../../../src/lib/modules/waivers/repos/mocks/mockWaiverRepo';
import { MockInvoiceItemRepo } from './../../../../../../src/lib/modules/invoices/repos/mocks/mockInvoiceItemRepo';
import { MockPayerRepo } from './../../../../../../src/lib/modules/payers/repos/mocks/mockPayerRepo';
import { MockInvoiceRepo } from './../../../../../../src/lib/modules/invoices/repos/mocks/mockInvoiceRepo';

import { GenerateDraftCompensatoryEventsUsecase } from '../../../../../../src/lib/modules/invoices/usecases/generateDraftCompensatoryEvents';

Before({ tags: '@generateDraftCompensatoryEvents' }, function () {
  const invoiceItem = new MockInvoiceItemRepo();
  const manuscript = new MockArticleRepo();
  const invoice = new MockInvoiceRepo(manuscript, invoiceItem);
  const coupon = new MockCouponRepo();
  const waiver = new MockWaiverRepo();

  const queueService = new MockSqsPublishService();
  const logger = new MockLogger();

  const context = {
    repos: {
      invoiceItem,
      manuscript,
      invoice,
      coupon,
      waiver,
    },
    services: {
      queueService,
      logger,
    },
  };

  const usecase = new GenerateDraftCompensatoryEventsUsecase(
    invoiceItem,
    manuscript,
    invoice,
    coupon,
    waiver,
    queueService,
    logger
  );

  this.context = context;
  this.usecase = usecase;
});
