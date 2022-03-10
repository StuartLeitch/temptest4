import { JournalUpdated as JournalUpdatedEvent } from '@hindawi/phenom-events';

import { Either, right, left } from '../../../../../core/logic/Either';
import { UnexpectedError } from '../../../../../core/logic/AppError';
import { UseCase } from '../../../../../core/domain/UseCase';

import { EventUtils } from '../../../../../utils/EventUtils';

// Authorization Logic
import { UsecaseAuthorizationContext as Context } from '../../../../../domain/authorization';

import { CatalogItem } from '../../../../journals/domain/CatalogItem';

import { SQSPublishServiceContract } from '../../../../../domain/services/SQSPublishService';

import { PublishJournalUpdatedResponse as Response } from './publishJournalUpdatedResponse';
import { PublishJournalUpdatedDTO as DTO } from './publishJournalUpdatedDTO';
import * as Errors from './publishJournalUpdatedErrors';

const JOURNAL_UPDATED = 'JournalUpdated';

export class PublishJournalUpdatedUsecase
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(private publishService: SQSPublishServiceContract) {}

  public async execute(request: DTO, context?: Context): Promise<Response> {
    const validRequest = this.verifyInput(request);
    if (validRequest.isLeft()) {
      return validRequest;
    }

    const { journal, messageTimestamp } = request;

    // TO-DO Define journal update event data
    const data = {
      apc: journal.amount,
    };

    try {
      await this.publishService.publishMessage({
        timestamp: messageTimestamp?.toISOString(),
        event: JOURNAL_UPDATED,
        data,
      });

      return right(null);
    } catch (err) {
      return left(new UnexpectedError(err.toString()));
    }
  }

  private verifyInput(request: DTO): Either<Errors.JournalRequiredError, void> {
    if (!request.journal) {
      return left(new Errors.JournalRequiredError());
    }
  }
}
