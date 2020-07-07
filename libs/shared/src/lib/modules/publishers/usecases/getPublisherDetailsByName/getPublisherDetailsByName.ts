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
import { GetPublisherDetailsByNameResponse } from './getPublisherDetailsByNameResponse';
import { GetPublisherDetailsByNameErrors } from './getPublisherDetailsByNameErrors';
import { GetPublisherDetailsByNameDTO } from './getPublisherDetailsByNameDTO';

export type GetPublisherDetailsByNameContext = AuthorizationContext<Roles>;

export class GetPublisherDetailsByNameUsecase
  implements
    UseCase<
      GetPublisherDetailsByNameDTO,
      Promise<GetPublisherDetailsByNameResponse>,
      GetPublisherDetailsByNameContext
    >,
    AccessControlledUsecase<
      GetPublisherDetailsByNameDTO,
      GetPublisherDetailsByNameContext,
      AccessControlContext
    > {
  constructor(private publisherRepo: PublisherRepoContract) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  // @Authorize('invoice:read')
  public async execute(
    request: GetPublisherDetailsByNameDTO,
    context?: GetPublisherDetailsByNameContext
  ): Promise<GetPublisherDetailsByNameResponse> {
    try {
      const { publisherName: name } = request;

      const publisher = await this.publisherRepo.getPublisherByName(name);
      return right(Result.ok(publisher));
    } catch (e) {
      if (e.code === RepoErrorCode.ENTITY_NOT_FOUND) {
        return left(
          new GetPublisherDetailsByNameErrors.PublisherNotFoundError(name)
        );
      }
      return left(new AppError.UnexpectedError(e));
    }
  }
}
