// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { AppError } from '../../../../core/logic/AppError';
import { Result, left, right } from '../../../../core/logic/Result';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';

// * Authorization Logic
import {
  Authorize,
  AuthorizationContext,
  AccessControlledUsecase
} from '../../../../domain/authorization/decorators/Authorize';
import { AccessControlContext } from '../../../../domain/authorization/AccessControl';
import { Roles } from '../../../users/domain/enums/Roles';

import { PublisherRepoContract } from '../../repos/publisherRepo';

// * Usecase specific
import { GetPublisherCustomValuesResponse } from './getPublisherCustomValuesResponse';
import { GetPublisherCustomValuesErrors } from './getPublisherCustomValuesErrors';
import { GetPublisherCustomValuesDTO } from './getPublisherCustomValuesDTO';
import { PublisherId } from '../../domain/PublisherId';

export type GetPublisherCustomValuesContext = AuthorizationContext<Roles>;

export class GetPublisherCustomValuesUsecase
  implements
    UseCase<
      GetPublisherCustomValuesDTO,
      Promise<GetPublisherCustomValuesResponse>,
      GetPublisherCustomValuesContext
    >,
    AccessControlledUsecase<
      GetPublisherCustomValuesDTO,
      GetPublisherCustomValuesContext,
      AccessControlContext
    > {
  constructor(private publisherRepo: PublisherRepoContract) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  // @Authorize('invoice:read')
  public async execute(
    request: GetPublisherCustomValuesDTO,
    context?: GetPublisherCustomValuesContext
  ): Promise<GetPublisherCustomValuesResponse> {
    try {
      const id = PublisherId.create(
        new UniqueEntityID(request.publisherId)
      ).getValue();
      const customValues = await this.publisherRepo.getCustomValuesByPublisherId(
        id
      );
      return right(Result.ok(customValues));
    } catch (e) {
      if (e.code) {
        return left(
          new GetPublisherCustomValuesErrors.PublisherNotFount(
            request.publisherId
          )
        );
      } else {
        return left(new AppError.UnexpectedError(e));
      }
    }
  }
}
