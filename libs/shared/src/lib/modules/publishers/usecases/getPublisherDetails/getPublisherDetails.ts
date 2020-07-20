/* eslint-disable @typescript-eslint/no-unused-vars */

// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { AppError } from '../../../../core/logic/AppError';
import { Result, left, right } from '../../../../core/logic/Result';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';

// * Authorization Logic
import {
  AccessControlledUsecase,
  UsecaseAuthorizationContext,
  AccessControlContext,
} from '../../../../domain/authorization';

import { PublisherRepoContract } from '../../repos';

// * Usecase specific
import { GetPublisherDetailsResponse } from './getPublisherDetailsResponse';
import { GetPublisherDetailsErrors } from './getPublisherDetailsErrors';
import { GetPublisherDetailsDTO } from './getPublisherDetailsDTO';
import { PublisherId } from '../../domain/PublisherId';

export class GetPublisherDetailsUsecase
  implements
    UseCase<
      GetPublisherDetailsDTO,
      Promise<GetPublisherDetailsResponse>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      GetPublisherDetailsDTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(private publisherRepo: PublisherRepoContract) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  // @Authorize('invoice:read')
  public async execute(
    request: GetPublisherDetailsDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<GetPublisherDetailsResponse> {
    try {
      const id = PublisherId.create(
        new UniqueEntityID(request.publisherId)
      ).getValue();

      const exists = await this.publisherRepo.publisherWithIdExists(id);
      if (!exists) {
        return left(
          new GetPublisherDetailsErrors.PublisherNotFoundError(
            request.publisherId
          )
        );
      }

      const publisher = await this.publisherRepo.getPublisherById(id);
      return right(Result.ok(publisher));
    } catch (e) {
      return left(new AppError.UnexpectedError(e));
    }
  }
}
