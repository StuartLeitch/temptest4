/* eslint-disable max-len */
// * Domain imports
// import {InvoiceStatus} from '@hindawi/shared';

import { VersionCompare } from './../../../../../libs/shared/src/lib/utils/VersionCompare';
import { Roles } from '../../../../../libs/shared/src/lib/modules/users/domain/enums/Roles';

import { UpdateTransactionOnAcceptManuscriptUsecase } from '../../../../../libs/shared/src/lib/modules/transactions/usecases/updateTransactionOnAcceptManuscript/updateTransactionOnAcceptManuscript';
import { UpdateTransactionContext } from '../../../../../libs/shared/src/lib/modules/transactions/usecases/updateTransactionOnAcceptManuscript/updateTransactionOnAcceptManuscriptAuthorizationContext';

import { Logger } from '../../lib/logger';
import { env } from '../../env';

const defaultContext: UpdateTransactionContext = { roles: [Roles.SUPER_ADMIN] };

const SUBMISSION_QUALITY_CHECK_PASSED = 'SubmissionQualityCheckPassed';
const logger = new Logger(`events:${SUBMISSION_QUALITY_CHECK_PASSED}`);

export const SubmissionQualityCheckPassedHandler = {
  event: SUBMISSION_QUALITY_CHECK_PASSED,
  handler: async function submissionQualityCheckPassedHandler(data: any) {
    logger.info('Incoming Event Data', data);

    const { submissionId, manuscripts } = data;

    const maxVersion = manuscripts.reduce((max, m: any) => {
      const version = VersionCompare.versionCompare(m.version, max)
        ? m.version
        : max;
      return version;
    }, manuscripts[0].version);

    const {
      customId,
      title,
      articleType: { name },
      authors
    } = manuscripts.find((m: any) => m.version === maxVersion);

    const { email, country, surname, givenNames } = authors.find(
      (a: any) => a.isCorresponding
    );

    const {
      repos: {
        transaction: transactionRepo,
        invoice: invoiceRepo,
        invoiceItem: invoiceItemRepo,
        manuscript: manuscriptRepo,
        waiver: waiverRepo,
        catalog: catalogRepo
      },
      waiverService,
      emailService
    } = this;

    // catalogRepo.getCatalogItemByJournalId();

    const updateTransactionOnAcceptManuscript: UpdateTransactionOnAcceptManuscriptUsecase = new UpdateTransactionOnAcceptManuscriptUsecase(
      catalogRepo,
      transactionRepo,
      invoiceItemRepo,
      invoiceRepo,
      manuscriptRepo,
      waiverRepo,
      waiverService,
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
          name: env.app.invoicePaymentEmailSenderName
        }
      },
      defaultContext
    );

    if (result.isLeft()) {
      logger.error(result.value.error.toString());
    }
  }
};
