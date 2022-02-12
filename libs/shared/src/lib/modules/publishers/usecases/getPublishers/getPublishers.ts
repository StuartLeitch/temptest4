// * Core Domain
import { UnexpectedError } from '../../../../core/logic/AppError';
import { left, right } from '../../../../core/logic/Either';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../domain/authorization';

import { PublisherRepoContract } from '../../repos';

// * Usecase specifics
import { GetPublishersResponse as Response } from './getPublishersResponse';
import type { GetPublishersDTO as DTO } from './getPublishersDTO';

export class GetPublishersUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(private publisherRepo: PublisherRepoContract) {
    super();
  }

  @Authorize('publishers:read')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    try {
      const maybePaginatedResult = await this.publisherRepo.getPublishers(
        request
      );

      if (maybePaginatedResult.isLeft()) {
        return left(
          new UnexpectedError(new Error(maybePaginatedResult.value.message))
        );
      }
      return right(maybePaginatedResult.value);
    } catch (err) {
      return left(new UnexpectedError(err, 'Getting publisher names failed!'));
    }
  }
}
