/* eslint-disable @nrwl/nx/enforce-module-boundaries */
/* eslint-disable max-len */

// * Domain imports
import { SubmissionPeerReviewCycleCheckPassed as SPRCCP } from '@hindawi/phenom-events';
import {
  GetTransactionDetailsByManuscriptCustomIdUsecase,
  UpdateTransactionOnAcceptManuscriptUsecase,
  UsecaseAuthorizationContext,
  TransactionStatus,
  VersionCompare,
  Roles,
} from '@hindawi/shared';
import { ManuscriptTypeNotInvoiceable } from './../../../../../libs/shared/src/lib/modules/manuscripts/domain/ManuscriptTypes';

import { Context } from '../../builders';

import { EventHandler } from '../event-handler';
import { SubmissionSubmittedHelpers } from './submission-submitted/helpers';

import { env } from '../../env';

const defaultContext: UsecaseAuthorizationContext = {
  roles: [Roles.SUPER_ADMIN],
};

const SUBMISSION_PEER_REVIEW_CYCLE_CHECK_PASSED =
  'SubmissionPeerReviewCycleCheckPassed';

export const SubmissionPeerReviewCycleCheckPassed: EventHandler<SPRCCP> = {
  event: SUBMISSION_PEER_REVIEW_CYCLE_CHECK_PASSED,
  handler(context: Context) {
    return async (data: SPRCCP): Promise<void> => {
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
        services: { waiverService, emailService, vatService, logger },
      } = context;

      logger.setScope(
        `PhenomEvent:${SUBMISSION_PEER_REVIEW_CYCLE_CHECK_PASSED}`
      );
      logger.info('Incoming Event Data', data);

      const { submissionId, manuscripts, updated } = data;

      if (manuscripts[0]?.articleType?.name in ManuscriptTypeNotInvoiceable) {
        return;
      }

      const helpers = new SubmissionSubmittedHelpers(context);
      const manuscript = await helpers.getExistingManuscript(submissionId);
      if (manuscript) {
        const { journalId } = manuscripts[0];

        await helpers.restore(manuscript.id.toString());

        if (journalId !== manuscript.journalId) {
          await helpers.updateInvoicePrice(manuscript.customId, journalId);
        }

        await helpers.updateManuscript(manuscript, data);
      }

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
        logger.error(maybeTransaction.value.message);
        throw maybeTransaction.value;
      }

      if (maybeTransaction.value.status !== TransactionStatus.DRAFT) {
        return;
      }

      const updateTransactionOnAcceptManuscript: UpdateTransactionOnAcceptManuscriptUsecase = new UpdateTransactionOnAcceptManuscriptUsecase(
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
