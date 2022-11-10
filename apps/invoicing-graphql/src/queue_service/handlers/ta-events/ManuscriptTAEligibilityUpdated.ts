import {EligibilityStatus, EligibilityType, ManuscriptTAEligibilityUpdated as ManuscriptTaEligibilityUpdatedPayload} from '@hindawi/phenom-events';
import {
  CreateCreditNoteUsecase,
  CreationReason,
  GetInvoiceDetailsUsecase,
  GetInvoiceIdByManuscriptCustomIdUsecase,
  GetPaymentsByInvoiceIdUsecase,
  Invoice,
  InvoiceStatus,
  Manuscript,
  ManuscriptTypeNotInvoiceable,
  Payment,
  Roles,
  SoftDeleteDraftInvoiceUsecase,
  UpdateTaApprovalUsecase,
  UpdateTransactionOnTADecisionUsecase,
  UsecaseAuthorizationContext,
} from '@hindawi/shared';

import {Context} from '../../../builders';

import {EventHandler} from '../../event-handler';
import {EventHandlerHelpers} from "../helpers";
import {UpdateTaEligibilityUsecase} from "../../../../../../libs/shared/src/lib/modules/manuscripts/usecases/updateTaApproval";
import {VError} from "verror";
import {env} from "@hindawi/invoicing-graphql/env";
import {TaDiscounts} from "./taEventsHelpers";

const ManuscriptTaEligibilityUpdated = 'ManuscriptTAEligibilityUpdated';

const defaultContext: UsecaseAuthorizationContext = {
  roles: [Roles.QUEUE_EVENT_HANDLER],
};

export const ManuscriptTAEligibilityUpdatedHandler: EventHandler<ManuscriptTaEligibilityUpdatedPayload> = {
  event: ManuscriptTaEligibilityUpdated,
  handler(context: Context) {
    const {
      repos: {
        creditNote: creditNoteRepo,
        address: addressRepo,
        waiver: waiverRepo,
        coupon: couponRepo,
        catalog: catalogRepo,
        transaction: transactionRepo,
        invoiceItem: invoiceItemRepo,
        invoice: invoiceRepo,
        manuscript: manuscriptRepo,
        pausedReminder: pausedReminderRepo,
        payment: paymentRepo,
        payer: payerRepo


      },
      services: {
        emailService,
        commsEmailService,
        vatService
      },
      loggerBuilder,
      auditLoggerServiceProvider,
    } = context;

    const auditLoggerService = auditLoggerServiceProvider({email: 'System'});
    const logger = loggerBuilder.getLogger(
      `PhenomEvent:${ManuscriptTaEligibilityUpdated}`
    );

    const eventHelpers = new EventHandlerHelpers(context);
    const updateTaEligibilityUseCase = new UpdateTaEligibilityUsecase(manuscriptRepo);
    const updateTaFundingRequestFlag = new UpdateTaApprovalUsecase(manuscriptRepo);
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

    const updateTransactionOnTADecisionUsecase = new UpdateTransactionOnTADecisionUsecase(
      addressRepo,
      catalogRepo,
      transactionRepo,
      invoiceItemRepo,
      invoiceRepo,
      manuscriptRepo,
      waiverRepo,
      payerRepo,
      couponRepo,
      emailService,
      vatService,
      logger
    );

    return async (payload: ManuscriptTaEligibilityUpdatedPayload) => {

      logger.info('Incoming Event Data', payload);

      const {
        data: {
          submissionId,
          eligibilityType,
          eligibilityStatus,
          discounts,
          approval: {
            customId
          }
        }
      } = payload

      const manuscriptDetails = await eventHelpers.getExistingManuscript(
        submissionId
      );

      const articleTypeName = manuscriptDetails.articleType
      if (articleTypeName in ManuscriptTypeNotInvoiceable) {
        return;
      }


      const {invoice, payments} = await getInvoiceWithPayments(customId);
      await updateTaEligible(manuscriptDetails, eligibilityType);
      await updateTaFundingApproved(manuscriptDetails, eligibilityStatus, eligibilityType);
      if(invoice.status === InvoiceStatus.ACTIVE && payload.data.eligibilityStatus === EligibilityStatus.Resolved && payload.data.eligibilityType === EligibilityType.FullCoverage) {
        await createCreditNoteOnLateApproval(payments, invoice, customId);
      } else {
        await activateSoftDeleteOrIgnoreInvoice(manuscriptDetails, discounts, submissionId, invoice.invoiceId.toString());
      }
    };


    function setEligibility(eligibilityType: EligibilityType): boolean {
      return eligibilityType === EligibilityType.FullCoverage || eligibilityType === EligibilityType.Discount
    }

    function setFundingResponse(eligibilityStatus: EligibilityStatus, eligibilityType: EligibilityType): boolean {
      return eligibilityStatus === EligibilityStatus.Resolved && eligibilityType === EligibilityType.FullCoverage
    }

    async function updateTaEligible(manuscriptDetails: Manuscript, eligibilityType: EligibilityType) {
      const updateTaEligibilityResult = await updateTaEligibilityUseCase.execute(
        {manuscript: manuscriptDetails, isEligible: setEligibility(eligibilityType)},
        defaultContext
      );

      if (updateTaEligibilityResult.isLeft()) {
        logger.error(updateTaEligibilityResult.value.message, updateTaEligibilityResult.value);
        throw new VError(updateTaEligibilityResult.value, updateTaEligibilityResult.value.message);
      }
    }

    async function updateTaFundingApproved(manuscriptDetails: Manuscript, eligibilityStatus: EligibilityStatus, eligibilityType: EligibilityType) {
      const updateTaFundingRequestResult = await updateTaFundingRequestFlag.execute(
        {manuscript: manuscriptDetails, isApproved: setFundingResponse(eligibilityStatus, eligibilityType)},
        defaultContext
      );

      if (updateTaFundingRequestResult.isLeft()) {
        logger.error(updateTaFundingRequestResult.value.message);
        throw updateTaFundingRequestResult.value;
      }
    }

    async function activateSoftDeleteOrIgnoreInvoice(manuscriptDetails: Manuscript, discounts: TaDiscounts, submissionId: string, invoiceId: string) {
      const updateTransactionResult = await updateTransactionOnTADecisionUsecase.execute(
        {
          manuscriptId: manuscriptDetails.manuscriptId.id.toString(),
          emailSenderInfo: {
            address: env.app.invoicePaymentEmailSenderAddress,
            name: env.app.invoicePaymentEmailSenderName,
          },
          bankTransferCopyReceiver: env.app.invoicePaymentEmailBankTransferCopyReceiver,
          discount: discounts,
          submissionId,
          invoiceId,
        },
        defaultContext
      );

      if (updateTransactionResult.isLeft()) {
        logger.error(updateTransactionResult.value.message);
        throw updateTransactionResult.value;
      }
    }

    async function createCreditNoteOnLateApproval( payments: Payment[], invoice: Invoice, customId: string) {
      const creditNoteResult = await createCreditNoteUsecase.execute({
        invoiceId: invoice.invoiceId.toString(),
        createDraft: false,
        reason: CreationReason.TA_LATE_APPROVAL,
      }, defaultContext)

      if (creditNoteResult.isLeft()) {
        logger.error(creditNoteResult.value.message);
        throw creditNoteResult.value;
      }

      const creditNoteNumber = creditNoteResult.value.persistentReferenceNumber
      if (payments.length > 0) {
        const invoiceNumber = invoice.persistentReferenceNumber
        const emailResult = await commsEmailService.sendRefundEmailForLateTaApproval(invoiceNumber, customId, creditNoteNumber)

        if (emailResult.isLeft()) {
          logger.error(emailResult.value.message);
          throw emailResult.value;
        }
      }
    }

    async function softDeleteTransaction(submissionId: string) {
      const result = await softDeleteDraftTransactionUsecase.execute(
        {
          manuscriptId: submissionId,
        },
        defaultContext
      );

      if (result.isLeft()) {
        logger.error(result.value.message);
        throw result.value;
      }
    }

    async function getInvoiceWithPayments(customId: string) {
      const maybeInvoiceId = await getInvoiceIdByCustomIdUsecase.execute({customId}, defaultContext)
      if (maybeInvoiceId.isLeft()) {
        logger.error(maybeInvoiceId.value.message);
        throw maybeInvoiceId.value;

      }
      const invoiceId = maybeInvoiceId.value[0]
      const maybeInvoiceDetails = await getInvoiceDetailsUsecase.execute({invoiceId: invoiceId.toString()}, defaultContext)
      if (maybeInvoiceDetails.isLeft()) {
        logger.error(maybeInvoiceDetails.value.message);
        throw maybeInvoiceDetails.value;

      }

      const invoice = maybeInvoiceDetails.value

      const maybePayments = await getPaymentsByInvoiceIdUsecase.execute({invoiceId: invoiceId.toString()}, defaultContext)
      if (maybePayments.isLeft()) {
        logger.error(maybePayments.value.message)
        throw maybePayments.value
      }

      const payments = maybePayments.value
      return {invoice, payments};
    }
  },
};

