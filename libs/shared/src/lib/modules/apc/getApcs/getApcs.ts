// * Core Domain
import { UnexpectedError } from '../../../../core/logic/AppError';
import { right, left } from '../../../../core/logic/Either';
import { UseCase } from '../../../../core/domain/UseCase';

import { AuditLogRepoContract } from '../../repos/auditLogRepo';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../domain/authorization';
// * Usecase specifics

import { GetApcsResponse as Response } from './getApcsResponse';
import type { GetApcsDTO as DTO } from './getApcsDTO';

export class GetApcsUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(private apcRepo: AuditLogRepoContract) {
    super();
  }

  @Authorize('apc:read')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    // TODO: add proper DDD types to the paginated result
    try {
      const maybePaginatedResult = await this.apcRepo.getApcs(request);

      if (maybePaginatedResult.isLeft()) {
        return left(
          new UnexpectedError(new Error(maybePaginatedResult.value.message))
        );
      }

      return right(maybePaginatedResult.value);
    } catch (err) {
      return left(new UnexpectedError(err, 'Getting APCs failed'));
    }
  }
}
