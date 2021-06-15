// * Core Domain
import { UnexpectedError } from '../../../../core/logic/AppError';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { right, left } from '../../../../core/logic/Either';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';

import { PublisherId } from '../../domain/PublisherId';

import { PublisherRepoContract } from '../../repos/publisherRepo';

// * Usecase specific
import { GetPublisherCustomValuesResponse as Response } from './getPublisherCustomValuesResponse';
import { GetPublisherCustomValuesDTO as DTO } from './getPublisherCustomValuesDTO';
import * as Errors from './getPublisherCustomValuesErrors';

export class GetPublisherCustomValuesUsecase
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(private publisherRepo: PublisherRepoContract) {}

  public async execute(request: DTO, context?: Context): Promise<Response> {
    try {
      const id = PublisherId.create(new UniqueEntityID(request.publisherId));

      const exists = await this.publisherRepo.publisherWithIdExists(id);
      if (!exists) {
        return left(new Errors.PublisherNotFount(request.publisherId));
      }

      const maybeCustomValues = await this.publisherRepo.getCustomValuesByPublisherId(
        id
      );

      if (maybeCustomValues.isLeft()) {
        return left(
          new UnexpectedError(new Error(maybeCustomValues.value.message))
        );
      }

      return right(maybeCustomValues.value);
    } catch (e) {
      return left(new UnexpectedError(e));
    }
  }
}
