/* eslint-disable max-len */

// * Domain imports
// import {InvoiceStatus} from '@hindawi/shared';

import { Roles } from './../../../../../libs/shared/src/lib/modules/users/domain/enums/Roles';

import { ManuscriptTypeNotInvoiceable } from './../../../../../libs/shared/src/lib/modules/manuscripts/domain/ManuscriptTypes';
import {
  CreateTransactionContext,
  CreateTransactionUsecase
} from '../../../../../libs/shared/src/lib/modules/transactions/usecases/createTransaction/createTransaction';
import { CreateManuscriptUsecase } from '../../../../../libs/shared/src/lib/modules/manuscripts/usecases/createManuscript/createManuscript';
import { CreateManuscriptDTO } from './../../../../../libs/shared/src/lib/modules/manuscripts/usecases/createManuscript/createManuscriptDTO';
import { GetManuscriptByManuscriptIdUsecase } from './../../../../../libs/shared/src/lib/modules/manuscripts/usecases/getManuscriptByManuscriptId/getManuscriptByManuscriptId';
import { SoftDeleteDraftTransactionUsecase } from './../../../../../libs/shared/src/lib/modules/transactions/usecases/softDeleteDraftTransaction/softDeleteDraftTransaction';
import { EditManuscriptUsecase } from './../../../../../libs/shared/src/lib/modules/manuscripts/usecases/editManuscript/editManuscript';
import { UpdateInvoiceItemsUsecase } from './../../../../../libs/shared/src/lib/modules/invoices/usecases/updateInvoiceItems/updateInvoiceItems';
import { GetInvoiceIdByManuscriptCustomIdUsecase } from './../../../../../libs/shared/src/lib/modules/invoices/usecases/getInvoiceIdByManuscriptCustomId/getInvoiceIdByManuscriptCustomId';
import { GetItemsForInvoiceUsecase } from './../../../../../libs/shared/src/lib/modules/invoices/usecases/getItemsForInvoice/getItemsForInvoice';
import { GetJournal } from './../../../../../libs/shared/src/lib/modules/journals/usecases/journals/getJournal/getJournal';

import { Logger } from '../../lib/logger';

const SUBMISSION_SUBMITTED = 'SubmissionSubmitted';
const defaultContext: CreateTransactionContext = { roles: [Roles.SUPER_ADMIN] };
const logger = new Logger(`PhenomEvent:${SUBMISSION_SUBMITTED}`);

export const SubmissionSubmittedHandler = {
  event: SUBMISSION_SUBMITTED,
  handler: async function submissionSubmittedHandler(data: any) {
    logger.info(`Incoming Event Data`, data);

    const {
      submissionId,
      manuscripts: [
        {
          customId,
          journalId,
          title,
          articleType: { name },
          submissionCreatedDate: created,
          authors
        }
      ]
    } = data;

    const { email, country, surname, givenNames } = authors.find(
      (a: any) => a.isCorresponding
    );

    const {
      repos: {
        transaction: transactionRepo,
        invoice: invoiceRepo,
        invoiceItem: invoiceItemRepo,
        catalog: catalogRepo,
        manuscript: manuscriptRepo,
        coupon: couponRepo,
        waiver: waiverRepo
      }
    } = this;

    const getManuscriptBySubmissionId: GetManuscriptByManuscriptIdUsecase = new GetManuscriptByManuscriptIdUsecase(
      manuscriptRepo
    );
    const editManuscript: EditManuscriptUsecase = new EditManuscriptUsecase(
      manuscriptRepo
    );
    const softDeleteDraftTransactionUsecase: SoftDeleteDraftTransactionUsecase = new SoftDeleteDraftTransactionUsecase(
      transactionRepo,
      invoiceItemRepo,
      invoiceRepo,
      manuscriptRepo
    );
    const getInvoiceIdByManuscriptCustomIdUsecase: GetInvoiceIdByManuscriptCustomIdUsecase = new GetInvoiceIdByManuscriptCustomIdUsecase(
      manuscriptRepo,
      invoiceItemRepo
    );
    const getItemsForInvoiceUsecase: GetItemsForInvoiceUsecase = new GetItemsForInvoiceUsecase(
      invoiceItemRepo,
      couponRepo,
      waiverRepo
    );
    const getJournalUsecase: GetJournal = new GetJournal(catalogRepo);
    const updateInvoiceItemsUsecase: UpdateInvoiceItemsUsecase = new UpdateInvoiceItemsUsecase(
      invoiceItemRepo
    );

    const alreadyExistingManuscriptResult = await getManuscriptBySubmissionId.execute(
      {
        manuscriptId: submissionId
      },
      defaultContext
    );

    if (alreadyExistingManuscriptResult.isLeft()) {
      logger.error(alreadyExistingManuscriptResult.value.errorValue().message);
      throw alreadyExistingManuscriptResult.value.error;
    }

    if (name in ManuscriptTypeNotInvoiceable) {
      await softDeleteDraftTransactionUsecase.execute(
        {
          manuscriptId: submissionId
        },
        defaultContext
      );
    }

    const alreadyExistingManuscript = alreadyExistingManuscriptResult.value.getValue();

    if (alreadyExistingManuscript) {
      if (name in ManuscriptTypeNotInvoiceable) {
        await softDeleteDraftTransactionUsecase.execute(
          {
            manuscriptId: submissionId
          },
          defaultContext
        );
      }

      if (journalId !== alreadyExistingManuscript.journalId) {
        let invoiceId = null;
        const invoiceIdResult = await getInvoiceIdByManuscriptCustomIdUsecase.execute(
          {
            customId: alreadyExistingManuscript.customId
          },
          defaultContext
        );
        if (invoiceIdResult.isLeft()) {
          logger.error(invoiceIdResult.value.errorValue().message);
          throw invoiceIdResult.value.error;
        } else {
          [invoiceId] = invoiceIdResult.value.getValue();
          logger.info(
            'Get invoice ID by manuscript custom ID',
            invoiceId.id.toString()
          );
        }

        let items: any = [];
        const itemsResult = await getItemsForInvoiceUsecase.execute(
          {
            invoiceId: invoiceId.id.toString()
          },
          defaultContext
        );
        if (itemsResult.isLeft()) {
          logger.error(itemsResult.value.errorValue().message);
          throw itemsResult.value.error;
        }

        items = itemsResult.value.getValue();
        logger.info('Get invoice items for Invoice ID', items);

        let journal = null;
        const journalResult = await getJournalUsecase.execute(
          {
            journalId
          },
          defaultContext
        );

        if (journalResult.isLeft()) {
          logger.error(journalResult.value.errorValue().message);
          throw journalResult.value.error;
        }

        journal = (journalResult as any).value.getValue();
        logger.info('Get Journal details for new journal ID', journal);

        items.forEach((i: any) => {
          i.price = journal.amount;
        });

        const updatedInvoiceItemsResult = await updateInvoiceItemsUsecase.execute(
          {
            invoiceItems: items
          },
          defaultContext
        );

        if (updatedInvoiceItemsResult.isLeft()) {
          logger.error(updatedInvoiceItemsResult.value.errorValue().message);
          throw updatedInvoiceItemsResult.value.error;
        }

        logger.info(
          'Update invoice items with new journal ID and price',
          items
        );
      }

      await editManuscript.execute(
        {
          journalId:
            journalId !== alreadyExistingManuscript.journalId
              ? journalId
              : alreadyExistingManuscript.journalId,
          manuscriptId: submissionId,
          title,
          articleType: name,
          authorEmail: email,
          authorCountry: country,
          authorSurname: surname,
          authorFirstName: givenNames
        },
        defaultContext
      );
    } else {
      if (name in ManuscriptTypeNotInvoiceable) {
        return;
      }

      const createTransactionUsecase: CreateTransactionUsecase = new CreateTransactionUsecase(
        transactionRepo,
        invoiceRepo,
        invoiceItemRepo,
        catalogRepo
      );

      const result = await createTransactionUsecase.execute(
        {
          manuscriptId: submissionId,
          journalId
        },
        defaultContext
      );

      if (result.isLeft()) {
        logger.error(result.value.errorValue().message);
        throw result.value.error;
      } else {
        const newTransaction = result.value.getValue();
        logger.info(`Transaction Data`, newTransaction);

        const manuscriptProps: CreateManuscriptDTO = {
          id: submissionId,
          customId,
          journalId,
          title,
          articleType: name,
          authorEmail: email,
          authorCountry: country,
          authorSurname: surname,
          authorFirstName: givenNames,
          created
        };

        const createManuscript: CreateManuscriptUsecase = new CreateManuscriptUsecase(
          manuscriptRepo
        );

        const createManuscriptResult = await createManuscript.execute(
          manuscriptProps,
          defaultContext
        );

        if (createManuscriptResult.isLeft()) {
          logger.error(createManuscriptResult.value.errorValue().message);
          throw createManuscriptResult.value.error;
        } else {
          const newManuscript = createManuscriptResult.value.getValue();

          logger.info('Manuscript Data', newManuscript);
        }
      }
    }
  }
};
