/* eslint-disable @typescript-eslint/no-unused-vars */

// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { Result, right } from '../../../../core/logic/Result';

// * Authorization Logic
import {
  AccessControlledUsecase,
  UsecaseAuthorizationContext,
  AccessControlContext,
} from '../../../../domain/authorization';

import { LoggerContract } from '../../../../infrastructure/logging/Logger';
import { FilterEventsService } from '../../services/FilterEventsService';
import { SaveEventsUsecase } from '../saveEvents/saveEvents';
import { SaveSqsEventsDTO } from './saveSqsEventsDTO';
import { SaveSqsEventsResponse } from './saveSqsEventsResponse';

export class SaveSqsEventsUsecase
  implements
    UseCase<
      SaveSqsEventsDTO,
      SaveSqsEventsResponse,
      UsecaseAuthorizationContext & { totalLimitPerTable: number }
    >,
    AccessControlledUsecase<
      SaveSqsEventsDTO,
      UsecaseAuthorizationContext & { totalLimitPerTable: number },
      AccessControlContext
    > {
  authorizationContext: UsecaseAuthorizationContext;

  constructor(
    private filterEventsService: FilterEventsService,
    private saveEventsUsecase: SaveEventsUsecase,
    private logger: LoggerContract
  ) {
    this.authorizationContext = { roles: [] };
  }

  public async execute(
    request: SaveSqsEventsDTO,
    context?: UsecaseAuthorizationContext & { totalLimitPerTable: number, mapCount: object }
  ): Promise<SaveSqsEventsResponse> {
    const start = new Date();
    try {
      const filteredEvents = await this.filterEventsService.filterEvents(
        request
      );

      await this.saveEventsUsecase.execute({
        events: filteredEvents,
      }, context);
      this.logger.info(
        `Saving ${filteredEvents.length} events took ${
          (new Date().getTime() - start.getTime()) / 1000
        } seconds.`
      );
    } catch (error) {
      this.logger.error(error);
    }

    return right(Result.ok());
  }
}
