// * Domain imports
// import {InvoiceStatus} from '@hindawi/shared';

import { VersionCompare } from './../../../../../libs/shared/src/lib/utils/VersionCompare';
import { Roles } from '../../../../../libs/shared/src/lib/modules/users/domain/enums/Roles';

import { UpdateTransactionOnAcceptManuscriptUsecase } from '../../../../../libs/shared/src/lib/modules/transactions/usecases/updateTransactionOnAcceptManuscript/updateTransactionOnAcceptManuscript';
import { UpdateTransactionContext } from '../../../../../libs/shared/src/lib/modules/transactions/usecases/updateTransactionOnAcceptManuscript/updateTransactionOnAcceptManuscriptAuthorizationContext';
import { Context } from '../../context';

const defaultContext: UpdateTransactionContext = { roles: [Roles.SUPER_ADMIN] };

const SUBMISSION_QUALITY_CHECK_PASSED = 'SubmissionQualityCheckPassed';

export const SubmissionQualityCheckPassedHandler = {
  event: SUBMISSION_QUALITY_CHECK_PASSED,
  handler: async function submissionQualityCheckPassedHandler(data: any) {
    console.log(`
[submissionQualityCheckPassedHandler Incoming Event Data]:
${JSON.stringify(data)}
    `);

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
    } = this as Context;

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
        authorFirstName: givenNames
      },
      defaultContext
    );

    if (result.isLeft()) {
      console.error(result.value.error);
    }
  }
};
