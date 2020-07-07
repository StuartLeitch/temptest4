// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { AppError } from '../../../../core/logic/AppError';
import { Result, left, right } from '../../../../core/logic/Result';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';

// * Authorization Logic
import {
  Authorize,
  AuthorizationContext,
  AccessControlledUsecase,
} from '../../../../domain/authorization/decorators/Authorize';
import { AccessControlContext } from '../../../../domain/authorization/AccessControl';
import { Roles } from '../../../users/domain/enums/Roles';

import { RepoErrorCode } from '../../../../infrastructure/RepoError';

import { PublisherRepoContract } from '../../repos';

// * Usecase specific
import { GetPublisherCustomValuesByNameResponse } from './getPublisherCustomValuesByNameResponse';
import { GetPublisherCustomValuesByNameErrors } from './getPublisherCustomValuesByNameErrors';
import { GetPublisherCustomValuesByNameDTO } from './getPublisherCustomValuesByNameDTO';

export type GetPublisherCustomValuesByNameContext = AuthorizationContext<Roles>;

export class GetPublisherCustomValuesByNameUsecase
  implements
    UseCase<
      GetPublisherCustomValuesByNameDTO,
      Promise<GetPublisherCustomValuesByNameResponse>,
      GetPublisherCustomValuesByNameContext
    >,
    AccessControlledUsecase<
      GetPublisherCustomValuesByNameDTO,
      GetPublisherCustomValuesByNameContext,
      AccessControlContext
    > {
  constructor(private publisherRepo: PublisherRepoContract) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  // @Authorize('invoice:read')
  public async execute(
    request: GetPublisherCustomValuesByNameDTO,
    context?: GetPublisherCustomValuesByNameContext
  ): Promise<GetPublisherCustomValuesByNameResponse> {
    try {
      const { publisherName: name } = request;

      const publisher = await this.publisherRepo.getPublisherByName(name);
      return right(Result.ok(publisher.customValue));
    } catch (e) {
      if (e.code === RepoErrorCode.ENTITY_NOT_FOUND) {
        return left(
          new GetPublisherCustomValuesByNameErrors.PublisherNotFound(name)
        );
      }
      return left(new AppError.UnexpectedError(e));
    }
  }
}
