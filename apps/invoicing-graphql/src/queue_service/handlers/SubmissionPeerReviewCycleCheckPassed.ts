import { SubmissionPeerReviewCycleCheckPassed as SPRCCP } from '@hindawi/phenom-events';

import {
  AsyncEither,
  GetInvoiceDetailsUsecase,
  GetTransactionDetailsByManuscriptCustomIdUsecase,
  InvoiceId,
  ManuscriptTypeNotInvoiceable,
  right,
  Roles,
  SoftDeleteDraftTransactionUsecase,
  TransactionStatus,
  UpdateInvoiceDateAcceptedUsecase,
  UpdateTransactionOnAcceptManuscriptUsecase,
  UsecaseAuthorizationContext,
} from '@hindawi/shared';

import { EventHandlerHelpers, extractLatestManuscript } from './helpers';
import { EventHandler } from '../event-handler';
import { Context } from '../../builders';
import { env } from '../../env';
import { VError } from 'verror';

const defaultContext: UsecaseAuthorizationContext = {
  roles: [Roles.QUEUE_EVENT_HANDLER],
};

const SUBMISSION_PEER_REVIEW_CYCLE_CHECK_PASSED = 'SubmissionPeerReviewCycleCheckPassed';

export const SubmissionPeerReviewCycleCheckPassed: EventHandler<SPRCCP> = {
  event: SUBMISSION_PEER_REVIEW_CYCLE_CHECK_PASSED,

  handler(context: Context) {
    const {
      repos: {
        address: addressRepo,
        transaction: transactionRepo,
        invoice: invoiceRepo,
        invoiceItem: invoiceItemRepo,
        manuscript: manuscriptRepo,
        waiver: waiverRepo,
        catalog: catalogRepo,
        payer: payerRepo,
        coupon: couponRepo,
      },
      services: { waiverService, emailService, vatService },
      loggerBuilder,
    } = context;

    const logger = loggerBuilder.getLogger(`PhenomEvent:${SUBMISSION_PEER_REVIEW_CYCLE_CHECK_PASSED}`);

    const getInvoiceDetailsUsecase = new GetInvoiceDetailsUsecase(invoiceRepo);
    const getTransactionByCustomIdUseCase = new GetTransactionDetailsByManuscriptCustomIdUsecase(
      invoiceItemRepo,
      transactionRepo,
      manuscriptRepo,
      invoiceRepo
    );
    const updateInvoiceDateAcceptedUsecase = new UpdateInvoiceDateAcceptedUsecase(invoiceRepo);

    const softDeleteDraftTransactionUsecase = new SoftDeleteDraftTransactionUsecase(
      transactionRepo,
      invoiceItemRepo,
      invoiceRepo,
      manuscriptRepo,
      logger
    );

    return async (eventData: SPRCCP): Promise<void> => {
      logger.info('Incoming Event Data', eventData);

      const eventHelpers = new EventHandlerHelpers(context);
      const manuscript = await eventHelpers.getExistingManuscript(eventData.submissionId);

      const latestManuscript = extractLatestManuscript(eventData);

      if (!manuscript) {
        logger.info(
          `PeerReviewCheckedMessage ignored for manuscript with id: '${latestManuscript.id}' because the journal with id: ${latestManuscript.journalId} is zero priced.`
        );
        return;
      }

      const invoiceId = await eventHelpers.getInvoiceId(manuscript.customId);

      if (latestManuscript?.articleType?.name in ManuscriptTypeNotInvoiceable) {
        logger.info(`Soft deleting invoice for submission: ${eventData.submissionId}`);
        await softDeleteDraftTransactionUsecase.execute({ manuscriptId: eventData.submissionId });
        return;
      }

      const isDeleted = await eventHelpers.checkIsInvoiceDeleted(invoiceId.id.toString());
      if (isDeleted) {
        logger.info(`PeerReviewCheckedMessage invoice with id: ${invoiceId} is deleted.`);
        return;
      }

      const { journalId } = latestManuscript;
      if (isJournalChanged(journalId, manuscript)) {
        await eventHelpers.updateInvoicePrice(manuscript.customId, manuscript.journalId);
      }

      await eventHelpers.updateManuscript(manuscript, eventData);

      // obtain transaction details
      const { customId } = latestManuscript;
      const transactionPromise = await getTransactionByCustomIdUseCase.execute({ customId }, defaultContext);

      if (transactionPromise.isLeft()) {
        logger.error(transactionPromise.value.message, transactionPromise.value);
        throw new VError(transactionPromise.value, transactionPromise.value.message);
      }

      if (transactionPromise.value.status !== TransactionStatus.DRAFT) {
        return;
      }

      const invoiceDetailsPromise = await getInvoiceDetailsUsecase.execute(
        { invoiceId: invoiceId.id.toString() },
        defaultContext
      );
      if (invoiceDetailsPromise.isLeft()) {
        logger.error(invoiceDetailsPromise.value.message, invoiceDetailsPromise.value);
        throw new VError(invoiceDetailsPromise.value, invoiceDetailsPromise.value.message);
      }

      // check if article is ta eligible to halt or continue the update

      if (manuscript.taEligible) {
        await updateInvoiceTADateAccepted(invoiceId, eventData.updated);
        return;
      }

      const updateTransactionOnAcceptManuscript: UpdateTransactionOnAcceptManuscriptUsecase =
        new UpdateTransactionOnAcceptManuscriptUsecase(
          addressRepo,
          catalogRepo,
          transactionRepo,
          invoiceItemRepo,
          invoiceRepo,
          manuscriptRepo,
          waiverRepo,
          waiverService,
          payerRepo,
          couponRepo,
          emailService,
          vatService,
          logger
        );

      const result = await updateTransactionOnAcceptManuscript.execute(
        {
          authorsEmails: latestManuscript.authors.map((a) => a.email),
          manuscriptId: eventData.submissionId,
          acceptanceDate: eventData.updated,
          bankTransferCopyReceiver: env.app.invoicePaymentEmailBankTransferCopyReceiver,
          emailSenderInfo: {
            address: env.app.invoicePaymentEmailSenderAddress,
            name: env.app.invoicePaymentEmailSenderName,
          },
          confirmationReminder: {
            delay: env.scheduler.confirmationReminderDelay,
            queueName: env.scheduler.emailRemindersQueue,
          },
        },
        defaultContext
      );

      if (result.isLeft()) {
        logger.error(result.value.message);
        throw result.value;
      }
    };

    function isJournalChanged(journalId, manuscript) {
      return journalId !== manuscript.journalId;
    }

    async function updateInvoiceTADateAccepted(invoiceId: InvoiceId, dateAccepted: string) {
      logger.info('The article is TA Eligible and funding was approved.');

      const maybeInvoiceDateAcceptedUpdated = await updateInvoiceDateAcceptedUsecase.execute(
        {
          invoiceId,
          dateAccepted,
        },
        defaultContext
      );

      if (maybeInvoiceDateAcceptedUpdated.isLeft()) {
        logger.error(maybeInvoiceDateAcceptedUpdated.value.message, maybeInvoiceDateAcceptedUpdated.value);
        throw new VError(maybeInvoiceDateAcceptedUpdated.value, maybeInvoiceDateAcceptedUpdated.value.message);
      }
    }
  },
};
