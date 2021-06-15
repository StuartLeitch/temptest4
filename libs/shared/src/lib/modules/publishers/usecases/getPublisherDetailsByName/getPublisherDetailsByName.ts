// * Core Domain
import { UnexpectedError } from '../../../../core/logic/AppError';
import { right, left } from '../../../../core/logic/Either';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';

import { RepoErrorCode } from '../../../../infrastructure/RepoError';

import { PublisherRepoContract } from '../../repos';

// * Usecase specific
import { GetPublisherDetailsByNameResponse as Response } from './getPublisherDetailsByNameResponse';
import { GetPublisherDetailsByNameDTO as DTO } from './getPublisherDetailsByNameDTO';
import * as Errors from './getPublisherDetailsByNameErrors';

export class GetPublisherDetailsByNameUsecase
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(private publisherRepo: PublisherRepoContract) {}

  public async execute(request: DTO, context?: Context): Promise<Response> {
    const { publisherName } = request;
    try {
      const maybePublisher = await this.publisherRepo.getPublisherByName(
        publisherName
      );

      if (maybePublisher.isLeft()) {
        return left(
          new UnexpectedError(new Error(maybePublisher.value.message))
        );
      }

      return right(maybePublisher.value);
    } catch (e) {
      if (e.code === RepoErrorCode.ENTITY_NOT_FOUND) {
        return left(new Errors.PublisherNotFoundError(publisherName));
      }
      return left(new UnexpectedError(e));
    }
  }
}
