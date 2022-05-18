import { SubmissionQualityCheckPassed as SQCP } from '@hindawi/phenom-events';

import {
  GetTransactionDetailsByManuscriptCustomIdUsecase,
  UpdateTransactionOnAcceptManuscriptUsecase,
  ManuscriptTypeNotInvoiceable,
  UsecaseAuthorizationContext,
  TransactionStatus,
  Roles,
} from '@hindawi/shared';

import { EventHandlerHelpers, getLatestManuscript } from './helpers';
import { EventHandler } from '../event-handler';
import { Context } from '../../builders';
import { env } from '../../env';

const defaultContext: UsecaseAuthorizationContext = {
  roles: [Roles.QUEUE_EVENT_HANDLER],
};

const SUBMISSION_QUALITY_CHECK_PASSED = 'SubmissionQualityCheckPassed';

export const SubmissionQualityCheckPassed: EventHandler<SQCP> = {
  event: SUBMISSION_QUALITY_CHECK_PASSED,
  handler(context: Context) {
    return async (data: SQCP): Promise<void> => {
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

      const logger = loggerBuilder.getLogger(
        `PhenomEvent:${SUBMISSION_QUALITY_CHECK_PASSED}`
      );
      logger.info('Incoming Event Data', data);

      const { submissionId, updated } = data;

      const latestManuscript = getLatestManuscript(data);

      if (latestManuscript?.articleType?.name in ManuscriptTypeNotInvoiceable) {
        return;
      }

      const helpers = new EventHandlerHelpers(context);
      const manuscript = await helpers.getExistingManuscript(submissionId);

      if (manuscript) {
        const { journalId } = latestManuscript;

        const invoiceId = await helpers.getInvoiceId(manuscript.customId);

        const isDeleted = await helpers.checkIsInvoiceDeleted(
          invoiceId.id.toString()
        );

        if (isDeleted) {
          logger.info(
            `PeerReviewCheckedMessage invoice with id: ${invoiceId} is deleted.`
          );
          return;
        }

        if (journalId !== manuscript.journalId) {
          await helpers.updateInvoicePrice(manuscript.customId, journalId);
        }
      } else {
        logger.info(
          `PeerReviewCheckedMessage ignored for manuscript with id: '${latestManuscript.id}' because the journal with id: ${latestManuscript.journalId} is zero priced.`
        );
        return;
      }

      const {
        customId,
        title,
        articleType: { name },
        authors,
      } = latestManuscript;

      const { email, country, surname, givenNames } = authors.find(
        (a) => a.isCorresponding
      );

      const getTransactionUsecase =
        new GetTransactionDetailsByManuscriptCustomIdUsecase(
          invoiceItemRepo,
          transactionRepo,
          manuscriptRepo,
          invoiceRepo
        );

      const maybeTransaction = await getTransactionUsecase.execute(
        { customId },
        defaultContext
      );

      if (maybeTransaction.isLeft()) {
        logger.error(maybeTransaction.value.message);
        throw maybeTransaction.value;
      }

      if (maybeTransaction.value.status !== TransactionStatus.DRAFT) {
        return;
      }

      const updateTransactionOnAcceptManuscript =
        new UpdateTransactionOnAcceptManuscriptUsecase(
          addressRepo,
          catalogRepo,
          transactionRepo,
          invoiceItemRepo,
          invoiceRepo,
          manuscriptRepo,
          waiverRepo,
          payerRepo,
          couponRepo,
          waiverService,
          emailService,
          vatService,
          logger
        );

      const result = await updateTransactionOnAcceptManuscript.execute(
        {
          manuscriptId: submissionId,
          authorsEmails: authors.map((a) => a.email),
          customId,
          title,
          articleType: name,
          correspondingAuthorEmail: email,
          correspondingAuthorCountry: country,
          correspondingAuthorSurname: surname,
          correspondingAuthorFirstName: givenNames,
          acceptanceDate: updated,
          bankTransferCopyReceiver:
            env.app.invoicePaymentEmailBankTransferCopyReceiver,
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
  },
};
