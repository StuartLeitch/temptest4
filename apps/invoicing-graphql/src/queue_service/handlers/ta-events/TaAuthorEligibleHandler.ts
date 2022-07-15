import { Context } from '../../../builders';
import { EventHandler } from '../../event-handler';
import {
  UsecaseAuthorizationContext,
  UpdateTaApprovalUsecase,
  Roles,
} from '@hindawi/shared';

import { EventHandlerHelpers } from '../helpers';
import {VError} from "verror";
import {UpdateTaEligibilityUsecase} from "../../../../../../libs/shared/src/lib/modules/manuscripts/usecases/updateTaApproval";

const TA_ELIGIBLE = 'TaAuthorEligibilityDecided';

// temporary until from phenom events
interface TaAuthorEligibilityDecided {
  eligible: boolean;
  submissionId: string;
}

const defaultContext: UsecaseAuthorizationContext = {
  roles: [Roles.QUEUE_EVENT_HANDLER],
};

export const TaAuthorEligibilityDecidedHandler: EventHandler<TaAuthorEligibilityDecided> =
  {
    event: TA_ELIGIBLE,
    handler(context: Context) {
      const eventHelpers = new EventHandlerHelpers(context);
      const articleRepo =  context.repos.manuscript;
      const loggerBuilder= context.loggerBuilder;
      const updateTaEligibilityUseCase = new UpdateTaEligibilityUsecase(articleRepo);

      return async (data: TaAuthorEligibilityDecided) => {

        const logger = loggerBuilder.getLogger(`PhenomEvent: ${TA_ELIGIBLE}`);
        logger.info(`Incoming Event Data`, data);

        // call a method that stores the taEligible value in the DB, recommend adding/creating a helper function

        const manuscriptDetails = await eventHelpers.getExistingManuscript(
          data.submissionId
        );

        const updateTaEligibilityResult = await updateTaEligibilityUseCase.execute(
          { manuscript: manuscriptDetails, isEligible: data.eligible },
          defaultContext
        );

        if (updateTaEligibilityResult.isLeft()) {
          logger.error(updateTaEligibilityResult.value.message, updateTaEligibilityResult.value);
          throw new VError(updateTaEligibilityResult.value, updateTaEligibilityResult.value.message);
        }
      };
    },
  };
