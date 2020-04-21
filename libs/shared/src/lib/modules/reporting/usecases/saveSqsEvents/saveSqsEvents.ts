// * Core Domain
import { LoggerContract } from 'libs/shared/src/lib/infrastructure/logging/Logger';
import { UseCase } from '../../../../core/domain/UseCase';
import { right } from '../../../../core/logic/Result';
import { AccessControlContext } from '../../../../domain/authorization/AccessControl';
import {
  AccessControlledUsecase,
  AuthorizationContext,
} from '../../../../domain/authorization/decorators/Authorize';
import { Roles } from '../../../users/domain/enums/Roles';
import { FilterEventsService } from '../../services/FilterEventsService';
import { SaveSqsEventsDTO } from './saveSqsEventsDTO';
import { SaveEventsUsecase } from '../saveEvents/saveEvents';

export type SaveSqsEventsContext = AuthorizationContext<Roles>;

export class SaveSqsEventsUsecase
  implements
    UseCase<SaveSqsEventsDTO, Promise<unknown>, SaveSqsEventsContext>,
    AccessControlledUsecase<
      SaveSqsEventsDTO,
      SaveSqsEventsContext,
      AccessControlContext
    > {
  authorizationContext: AuthorizationContext<Roles>;

  constructor(
    private filterEventsService: FilterEventsService,
    private saveEventsUsecase: SaveEventsUsecase,
    private logger: LoggerContract
  ) {
    this.authorizationContext = { roles: [] };
  }

  public async execute(
    request: SaveSqsEventsDTO,
    context?: SaveSqsEventsContext
  ): Promise<unknown> {
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
