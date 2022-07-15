import { Context } from '../../../builders';
import { EventHandler } from '../../event-handler';
import { EventHandlerHelpers } from '../helpers';
import {
  UpdateTransactionOnTADecisionUsecase,
  UsecaseAuthorizationContext,
  UpdateTaApprovalUsecase,
  Roles,
} from '@hindawi/shared';

import { env } from '../../../env';

const TA_FUNDING_REQUESTED = 'TaFundingRequested';

// temporary until from phenom events
interface TaFundingRequested {
  response: boolean;
  submissionId: string;
  discount?: number;
}

const defaultContext: UsecaseAuthorizationContext = {
  roles: [Roles.QUEUE_EVENT_HANDLER],
};

export const TaFundingRequestApprovedHandler: EventHandler<TaFundingRequested> = {
  event: TA_FUNDING_REQUESTED,
  handler(context: Context) {
    return async (data: TaFundingRequested) => {
      const {
        repos: {
          address: addressRepo,
          transaction: transactionRepo,
          invoice: invoiceRepo,
          invoiceItem: invoiceItemRepo,
          manuscript: articleRepo,
          waiver: waiverRepo,
          catalog: catalogRepo,
          payer: payerRepo,
          coupon: couponRepo,
        },
        services: { emailService, vatService },
        loggerBuilder,
      } = context;

      const eventHelpers = new EventHandlerHelpers(context);

      const logger = loggerBuilder.getLogger(`PhenomEvent: ${TA_FUNDING_REQUESTED}`);
      logger.info(`Incoming Event Data`, data);

      const { submissionId, discount } = data;

      // call a method that stores the taApproved value in the DB

      const updateTaFundingRequestFlag = new UpdateTaApprovalUsecase(articleRepo);
      const manuscriptDetails = await eventHelpers.getExistingManuscript(submissionId);

      const updateTaFundingRequestResult = await updateTaFundingRequestFlag.execute(
        { manuscript: manuscriptDetails, isApproved: data.response },
        defaultContext
      );

      if (updateTaFundingRequestResult.isLeft()) {
        logger.error(updateTaFundingRequestResult.value.message);
        throw updateTaFundingRequestResult.value;
      }

      // call the usecase that makes the combination shenanigan?

      const updateTransactionOnTADecisionUsecase = new UpdateTransactionOnTADecisionUsecase(
        addressRepo,
        catalogRepo,
        transactionRepo,
        invoiceItemRepo,
        invoiceRepo,
        articleRepo,
        waiverRepo,
        payerRepo,
        couponRepo,
        emailService,
        vatService,
        logger
      );

      const updateTransactionResult = await updateTransactionOnTADecisionUsecase.execute(
        {
          manuscriptId: manuscriptDetails.manuscriptId.id.toString(),
          emailSenderInfo: {
            address: env.app.invoicePaymentEmailSenderAddress,
            name: env.app.invoicePaymentEmailSenderName,
          },
          bankTransferCopyReceiver: env.app.invoicePaymentEmailBankTransferCopyReceiver,
          discount,
          submissionId,
        },
        defaultContext
      );

      if (updateTransactionResult.isLeft()) {
        logger.error(updateTransactionResult.value.message);
        throw updateTransactionResult.value;
      }
    };
  },
};
