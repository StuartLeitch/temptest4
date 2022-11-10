import {SubmissionWithdrawn as SubmissionWithdrawnPayload} from '@hindawi/phenom-events';

import {
  GetInvoiceIdByManuscriptCustomIdUsecase,
  CreateCreditNoteUsecase, CreationReason,
  SoftDeleteDraftInvoiceUsecase,
  GetManuscriptByManuscriptIdUsecase,
  GetPaymentsByInvoiceIdUsecase,
  ManuscriptTypeNotInvoiceable,
  UsecaseAuthorizationContext,
  GetInvoiceDetailsUsecase,
  InvoiceStatus,
  Roles,
} from '@hindawi/shared';

import {Context} from '../../builders';

import {EventHandler} from '../event-handler';

const SUBMISSION_WITHDRAWN = 'SubmissionWithdrawn';

const defaultContext: UsecaseAuthorizationContext = {
  roles: [Roles.QUEUE_EVENT_HANDLER],
};

export const SubmissionWithdrawn: EventHandler<SubmissionWithdrawnPayload> = {
  event: SUBMISSION_WITHDRAWN,
  handler(context: Context) {
    return async (data: SubmissionWithdrawnPayload) => {
      const {
        repos: {
          creditNote: creditNoteRepo,
          waiver: waiverRepo,
          coupon: couponRepo,
          transaction: transactionRepo,
          invoiceItem: invoiceItemRepo,
          invoice: invoiceRepo,
          manuscript: manuscriptRepo,
          pausedReminder: pausedReminderRepo,
          payment: paymentRepo,

        },
        services: {
          commsEmailService
        },
        loggerBuilder,
        auditLoggerServiceProvider,
      } = context;

      const auditLoggerService = auditLoggerServiceProvider({email: 'System'});
      const logger = loggerBuilder.getLogger(
        `PhenomEvent:${SUBMISSION_WITHDRAWN}`
      );
      logger.info('Incoming Event Data', data);
      const {
        submissionId,
        manuscripts: [
          {
            articleType: { name },
            customId,
          },
        ],
      } = data;

      if (name in ManuscriptTypeNotInvoiceable) {
        return;
      }

      const getInvoiceDetailsUsecase: GetInvoiceDetailsUsecase = new GetInvoiceDetailsUsecase(invoiceRepo)
      const getPaymentsByInvoiceIdUsecase: GetPaymentsByInvoiceIdUsecase = new GetPaymentsByInvoiceIdUsecase(invoiceRepo, paymentRepo)

      const getInvoiceIdByCustomIdUsecase: GetInvoiceIdByManuscriptCustomIdUsecase =
        new GetInvoiceIdByManuscriptCustomIdUsecase(
          manuscriptRepo,
          invoiceItemRepo
        )

      const createCreditNoteUsecase: CreateCreditNoteUsecase =
        new CreateCreditNoteUsecase(
          creditNoteRepo,
          invoiceRepo,
          invoiceItemRepo,
          couponRepo,
          waiverRepo,
          pausedReminderRepo,
          auditLoggerService
        )

      const softDeleteDraftTransactionUsecase: SoftDeleteDraftInvoiceUsecase =
        new SoftDeleteDraftInvoiceUsecase(
          transactionRepo,
          invoiceItemRepo,
          invoiceRepo,
          manuscriptRepo,
          logger
        );

      const maybeInvoiceId = await getInvoiceIdByCustomIdUsecase.execute({customId}, defaultContext)
      if(maybeInvoiceId.isLeft()) {
        logger.error(maybeInvoiceId.value.message);
        throw maybeInvoiceId.value;
      }

      const invoiceId = maybeInvoiceId.value[0]
      const maybeInvoiceDetails = await getInvoiceDetailsUsecase.execute({invoiceId: invoiceId.toString()}, defaultContext)
      if(maybeInvoiceDetails.isLeft()) {
        logger.error(maybeInvoiceDetails.value.message);
        throw maybeInvoiceDetails.value;
      }

      const invoice = maybeInvoiceDetails.value

      const maybePayments = await getPaymentsByInvoiceIdUsecase.execute({invoiceId: invoiceId.toString()}, defaultContext)
      if(maybePayments.isLeft()) {
        logger.error(maybePayments.value.message)
        throw maybePayments.value
      }

      const payments = maybePayments.value

      if(invoice.status !== InvoiceStatus.DRAFT) {
          const creditNoteResult = await createCreditNoteUsecase.execute({
            invoiceId: invoiceId.toString(),
            createDraft: false,
            reason: CreationReason.WITHDRAWN_MANUSCRIPT,
          }, defaultContext)

        if(creditNoteResult.isLeft()) {
          logger.error(creditNoteResult.value.message);
          throw creditNoteResult.value;
        }

        const creditNoteNumber = creditNoteResult.value.persistentReferenceNumber
        if(payments.length > 0) {
          const invoiceNumber = invoice.persistentReferenceNumber
          const emailResult = await commsEmailService.sendRefundEmailForWithdrawnManuscripts(invoiceNumber, customId, creditNoteNumber)

          if(emailResult.isLeft()) {
            logger.error(emailResult.value.message);
            throw emailResult.value;
          }
        }
      } else {

        const result = await softDeleteDraftTransactionUsecase.execute(
          {
            manuscriptId: submissionId,
          },
          defaultContext
        );

        if(result.isLeft()) {
          logger.error(result.value.message);
          throw result.value;
        }
      }

    };
  },
};
