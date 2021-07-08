// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { right } from '../../../../core/logic/Either';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';

import { LoggerContract } from '../../../../infrastructure/logging/Logger';

import { FilterEventsService } from '../../services/FilterEventsService';

import { SaveEventsUsecase } from '../saveEvents/saveEvents';

import { SaveSqsEventsResponse as Response } from './saveSqsEventsResponse';
import { SaveSqsEventsDTO as DTO } from './saveSqsEventsDTO';

export class SaveSqsEventsUsecase implements UseCase<DTO, Response, Context> {
  authorizationContext: Context;

  constructor(
    private filterEventsService: FilterEventsService,
    private saveEventsUsecase: SaveEventsUsecase,
    private logger: LoggerContract
  ) {
    this.authorizationContext = { roles: [] };
  }

  public async execute(request: DTO, context?: Context): Promise<Response> {
    const start = new Date();
    try {
      const filteredEvents = await this.filterEventsService.filterEvents(
        request
      );

      await this.saveEventsUsecase.execute({
        events: filteredEvents,
      });
      this.logger.info(
        `Saving ${filteredEvents.length} events took ${
          (new Date().getTime() - start.getTime()) / 1000
        } seconds.`
      );
    } catch (error) {
      this.logger.error(error);
    }

    return right(null);
  }
}
