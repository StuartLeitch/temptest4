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

import { PublisherRepoContract } from '../../repos';

// * Usecase specific
import { GetPublisherDetailsResponse } from './getPublisherDetailsResponse';
import { GetPublisherDetailsErrors } from './getPublisherDetailsErrors';
import { GetPublisherDetailsDTO } from './getPublisherDetailsDTO';
import { PublisherId } from '../../domain/PublisherId';

export type GetPublisherDetailsContext = AuthorizationContext<Roles>;

export class GetPublisherDetailsUsecase
  implements
    UseCase<
      GetPublisherDetailsDTO,
      Promise<GetPublisherDetailsResponse>,
      GetPublisherDetailsContext
    >,
    AccessControlledUsecase<
      GetPublisherDetailsDTO,
      GetPublisherDetailsContext,
      AccessControlContext
    > {
  constructor(private publisherRepo: PublisherRepoContract) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  // @Authorize('invoice:read')
  public async execute(
    request: GetPublisherDetailsDTO,
    context?: GetPublisherDetailsContext
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
