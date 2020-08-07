/* eslint-disable @typescript-eslint/no-unused-vars */

// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { AppError } from '../../../../core/logic/AppError';
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
import { GetPublisherCustomValuesByNameResponse } from './getPublisherCustomValuesByNameResponse';
import { GetPublisherCustomValuesByNameErrors } from './getPublisherCustomValuesByNameErrors';
import { GetPublisherCustomValuesByNameDTO } from './getPublisherCustomValuesByNameDTO';

export class GetPublisherCustomValuesByNameUsecase
  implements
    UseCase<
      GetPublisherCustomValuesByNameDTO,
      Promise<GetPublisherCustomValuesByNameResponse>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      GetPublisherCustomValuesByNameDTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(private publisherRepo: PublisherRepoContract) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  // @Authorize('invoice:read')
  public async execute(
    request: GetPublisherCustomValuesByNameDTO,
    context?: UsecaseAuthorizationContext
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
