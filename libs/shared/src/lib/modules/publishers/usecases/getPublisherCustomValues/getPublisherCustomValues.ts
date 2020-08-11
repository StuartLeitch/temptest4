/* eslint-disable @typescript-eslint/no-unused-vars */

// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { Result, left, right } from '../../../../core/logic/Result';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';

// * Authorization Logic
import {
  AccessControlledUsecase,
  UsecaseAuthorizationContext,
  AccessControlContext,
} from '../../../../domain/authorization';

import { PublisherRepoContract } from '../../repos/publisherRepo';

// * Usecase specific
import { GetPublisherCustomValuesResponse } from './getPublisherCustomValuesResponse';
import { GetPublisherCustomValuesErrors } from './getPublisherCustomValuesErrors';
import { GetPublisherCustomValuesDTO } from './getPublisherCustomValuesDTO';
import { PublisherId } from '../../domain/PublisherId';

export class GetPublisherCustomValuesUsecase
  implements
    UseCase<
      GetPublisherCustomValuesDTO,
      Promise<GetPublisherCustomValuesResponse>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      GetPublisherCustomValuesDTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(private publisherRepo: PublisherRepoContract) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  // @Authorize('invoice:read')
  public async execute(
    request: GetPublisherCustomValuesDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<GetPublisherCustomValuesResponse> {
    try {
      const id = PublisherId.create(
        new UniqueEntityID(request.publisherId)
      ).getValue();

      const exists = await this.publisherRepo.publisherWithIdExists(id);
      if (!exists) {
        return left(
          new GetPublisherCustomValuesErrors.PublisherNotFount(
            request.publisherId
          )
        );
      }

      const customValues = await this.publisherRepo.getCustomValuesByPublisherId(
        id
      );
      return right(Result.ok(customValues));
    } catch (e) {
      return left(new UnexpectedError(e));
    }
  }
}
