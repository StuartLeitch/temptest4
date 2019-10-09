import {Result} from '../../../../core/logic/Result';
import {UniqueEntityID} from '../../../../core/domain/UniqueEntityID';
import {DomainEvents} from '../../../../core/domain/events/DomainEvents';
import {Roles} from '../../../users/domain/enums/Roles';

import {MockTransactionRepo} from '../../../transactions/repos/mocks/mockTransactionRepo';
import {
  Transaction,
  STATUS as TransactionStatus
} from '../../../transactions/domain/Transaction';

import {ArticleId} from './../../../articles/domain/ArticleId';
import {MockInvoiceRepo} from '../../repos/mocks/mockInvoiceRepo';
import {Invoice, STATUS as InvoiceStatus} from '../../domain/Invoice';
import {SendInvoiceUsecase, SendInvoiceContext} from './sendInvoice';
import {AfterInvoiceSentEvent} from '../../subscribers/AfterInvoiceSentEvents';

import {MockEmailCommunicator} from '../../infrastructure/communication-channels/mocks/mockEmailCommunicator';
import {MockScheduler} from '../../infrastructure/scheduler/mocks/mockScheduler';

let usecase: SendInvoiceUsecase;
let mockInvoiceRepo: MockInvoiceRepo;
let mockTransactionRepo: MockTransactionRepo;
let mockEmailCommunicator: MockEmailCommunicator;
let mockScheduler: MockScheduler;
let result: Result<Invoice>;

let invoice: Invoice;
let invoiceId: string;
let transactionId: string;
let manuscriptId: any;

const defaultContext: SendInvoiceContext = {roles: [Roles.SUPER_ADMIN]};

describe('SendInvoiceUsecase', () => {
  describe('When NO Article ID is provided', () => {
    beforeEach(() => {
      mockInvoiceRepo = new MockInvoiceRepo();
      mockTransactionRepo = new MockTransactionRepo();
      mockEmailCommunicator = new MockEmailCommunicator();
      mockScheduler = new MockScheduler();

      usecase = new SendInvoiceUsecase(mockInvoiceRepo, mockTransactionRepo);
    });

    it('should fail', async () => {
      // * act
      result = await usecase.execute({}, defaultContext);

      expect(result.isFailure).toBeTruthy();
    });
  });

  describe('When Manuscript ID is provided', () => {
    beforeEach(() => {
      manuscriptId = 'test-manuscript';

      mockTransactionRepo = new MockTransactionRepo();
      mockInvoiceRepo = new MockInvoiceRepo();

      transactionId = 'test-transaction';
      const transaction = Transaction.create(
        {
          status: TransactionStatus.DRAFT,
          manuscriptId: ArticleId.create(manuscriptId)
        },
        new UniqueEntityID(transactionId)
      ).getValue();

      invoiceId = 'test-invoice';
      invoice = Invoice.create(
        {
          status: InvoiceStatus.DRAFT
        },
        new UniqueEntityID(invoiceId)
      ).getValue();

      // transaction.amount = TransactionAmount.create(100).getValue();
      transaction.addInvoice(invoice);

      mockTransactionRepo.save(transaction);
      mockInvoiceRepo.save(invoice);

      usecase = new SendInvoiceUsecase(mockInvoiceRepo, mockTransactionRepo);
    });

    describe('And Manuscript ID is INVALID', () => {
      it('should fail', async () => {
        result = await usecase.execute(
          {
            manuscriptId: null
          },
          defaultContext
        );
        expect(result.isFailure).toBeTruthy();
      });
    });

    describe('And Manuscript ID is VALID', () => {
      it('should emit "InvoiceSent" event', async () => {
        const afterEvents = new AfterInvoiceSentEvent(
          mockInvoiceRepo,
          mockEmailCommunicator,
          mockScheduler
        );
        afterEvents.setupSubscriptions();

        const spyInvoiceSend = jest.spyOn(invoice, 'send');
        // arrange
        result = await usecase.execute(
          {
            manuscriptId
          },
          defaultContext
        );

        expect(result.isSuccess).toBeTruthy();
        expect(result.getValue()).toBeNull();
        expect(spyInvoiceSend).toHaveBeenCalled();

        // Dispatch the events now
        DomainEvents.dispatchEventsForAggregate(invoice.id);
      });
    });
  });
});
