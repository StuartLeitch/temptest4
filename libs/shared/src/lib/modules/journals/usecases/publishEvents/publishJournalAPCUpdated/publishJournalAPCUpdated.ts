import { JournalAPCUpdated } from '@hindawi/phenom-events';

import { Either, right, left } from '../../../../../core/logic/Either';
import { UnexpectedError } from '../../../../../core/logic/AppError';
import { UseCase } from '../../../../../core/domain/UseCase';

import { EventUtils } from '../../../../../utils/EventUtils';

// Authorization Logic
import { UsecaseAuthorizationContext as Context } from '../../../../../domain/authorization';

import { SQSPublishServiceContract } from '../../../../../domain/services/SQSPublishService';

import { PublishJournalAPCUpdatedResponse as Response } from './publishJournalAPCUpdatedResponse';
import { PublishJournalAPCUpdatedDTO as DTO } from './publishJournalAPCUpdatedDTO';
import * as Errors from './publishJournalAPCUpdatedErrors';

const JOURNAL_APC_UDPATED = 'JournalAPCUpdated';

export class PublishJournalAPCUpdatedUsecase
  implements UseCase<DTO, Promise<Response>, Context>
{
  constructor(private publishService: SQSPublishServiceContract) {}

  public async execute(request: DTO, context?: Context): Promise<Response> {
    const validRequest = this.verifyInput(request);
    if (validRequest.isLeft()) {
      return validRequest;
    }

    const { journal, messageTimestamp } = request;

    const data: JournalAPCUpdated = {
      ...EventUtils.createEventObject(),
      id: journal.journalId.id.toString(),
      apc: journal.amount,
    };

    try {
      await this.publishService.publishMessage({
        timestamp: messageTimestamp?.toISOString(),
        event: JOURNAL_APC_UDPATED,
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

    return right(null);
  }
}
