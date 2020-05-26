// * Domain imports
import { SubmissionQualityCheckPassed as SubmissionQualityCheckPassedEvent } from '@hindawi/phenom-events';
import {
  GetTransactionDetailsByManuscriptCustomIdUsecase,
  UpdateTransactionOnAcceptManuscriptUsecase,
  STATUS as TransactionStatus,
  UpdateTransactionContext,
  VersionCompare,
  Roles,
} from '@hindawi/shared';

import { Logger } from '../../lib/logger';
import { env } from '../../env';

const defaultContext: UpdateTransactionContext = { roles: [Roles.SUPER_ADMIN] };

const SUBMISSION_QUALITY_CHECK_PASSED = 'SubmissionQualityCheckPassed';

const logger = new Logger(`PhenomEvent:${SUBMISSION_QUALITY_CHECK_PASSED}`);

export const SubmissionQualityCheckPassed = {
  event: SUBMISSION_QUALITY_CHECK_PASSED,
  handler: async function submissionQualityCheckPassedHandler(
    data: SubmissionQualityCheckPassedEvent
  ) {
    logger.info('Incoming Event Data', data);

    const { submissionId, manuscripts } = data;

    const maxVersion = manuscripts.reduce((max, m) => {
      const version = VersionCompare.versionCompare(m.version, max)
        ? m.version
        : max;
      return version;
    }, manuscripts[0].version);

    const {
      customId,
      title,
      articleType: { name },
      authors,
    } = manuscripts.find((m) => m.version === maxVersion);

    const { email, country, surname, givenNames } = authors.find(
      (a) => a.isCorresponding
    );

    const {
      repos: {
        transaction: transactionRepo,
        invoice: invoiceRepo,
        invoiceItem: invoiceItemRepo,
        manuscript: manuscriptRepo,
        waiver: waiverRepo,
        catalog: catalogRepo,
      },
      services: { waiverService, emailService, schedulingService },
    } = this;

    // catalogRepo.getCatalogItemByJournalId();

    const getTransactionUsecase = new GetTransactionDetailsByManuscriptCustomIdUsecase(
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
      logger.error(maybeTransaction.value.errorValue().message);
      throw maybeTransaction.value.error;
    }

    if (maybeTransaction.value.getValue().status !== TransactionStatus.DRAFT) {
      return;
    }

    const updateTransactionOnAcceptManuscript: UpdateTransactionOnAcceptManuscriptUsecase = new UpdateTransactionOnAcceptManuscriptUsecase(
      catalogRepo,
      transactionRepo,
      invoiceItemRepo,
      invoiceRepo,
      manuscriptRepo,
      waiverRepo,
      waiverService,
      schedulingService,
      emailService
    );

    const result = await updateTransactionOnAcceptManuscript.execute(
      {
        manuscriptId: submissionId,
        customId,
        title,
        articleType: name,
        authorEmail: email,
        authorCountry: country,
        authorSurname: surname,
        authorFirstName: givenNames,
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
      logger.error(result.value.errorValue().message);
      throw result.value.error;
    }
  },
};
