/* eslint-disable @typescript-eslint/no-unused-vars */

// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { Result, left, right } from '../../../../core/logic/Result';

// * Authorization Logic
import {
  AccessControlledUsecase,
  UsecaseAuthorizationContext,
  AccessControlContext,
} from '../../../../domain/authorization';

import { RepoErrorCode } from '../../../../infrastructure/RepoError';

import { PublisherRepoContract } from '../../repos';

// * Usecase specific
import { GetPublisherDetailsByNameResponse } from './getPublisherDetailsByNameResponse';
import { GetPublisherDetailsByNameErrors } from './getPublisherDetailsByNameErrors';
import { GetPublisherDetailsByNameDTO } from './getPublisherDetailsByNameDTO';

export class GetPublisherDetailsByNameUsecase
  implements
    UseCase<
      GetPublisherDetailsByNameDTO,
      Promise<GetPublisherDetailsByNameResponse>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      GetPublisherDetailsByNameDTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(private publisherRepo: PublisherRepoContract) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  // @Authorize('invoice:read')
  public async execute(
    request: GetPublisherDetailsByNameDTO,
    context?: UsecaseAuthorizationContext
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
      return left(new UnexpectedError(e));
    }
  }
}
