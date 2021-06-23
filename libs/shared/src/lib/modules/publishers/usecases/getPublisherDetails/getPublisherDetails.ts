// * Core Domain
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { right, left } from '../../../../core/logic/Either';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';

import { PublisherId } from '../../domain/PublisherId';

import { PublisherRepoContract } from '../../repos';

// * Usecase specific
import { GetPublisherDetailsResponse as Response } from './getPublisherDetailsResponse';
import { GetPublisherDetailsDTO as DTO } from './getPublisherDetailsDTO';
import * as Errors from './getPublisherDetailsErrors';

export class GetPublisherDetailsUsecase
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(private publisherRepo: PublisherRepoContract) {}

  public async execute(request: DTO, context?: Context): Promise<Response> {
    try {
      const id = PublisherId.create(new UniqueEntityID(request.publisherId));

      const exists = await this.publisherRepo.publisherWithIdExists(id);
      if (!exists) {
        return left(new Errors.PublisherNotFoundError(request.publisherId));
      }

      const maybePublisher = await this.publisherRepo.getPublisherById(id);

      if (maybePublisher.isLeft()) {
        return left(
          new UnexpectedError(new Error(maybePublisher.value.message))
        );
      }

      return right(maybePublisher.value);
    } catch (e) {
      return left(new UnexpectedError(e));
    }
  }
}
