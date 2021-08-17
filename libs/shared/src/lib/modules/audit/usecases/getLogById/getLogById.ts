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

import { GetLogByIdResponse as Response } from './getLogByIdResponse';
import type { GetLogByIdDTO as DTO } from './getLogByIdDTO';

export class GetLogByIdUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(private auditRepo: AuditLogRepoContract) {
    super();
  }

  @Authorize('logs:read')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    // TODO: add proper DDD types to the paginated result
    try {
      const maybeLog = await this.auditRepo.getLogById(
        request.id
      );

      if (maybeLog.isLeft()) {
        return left(
          new UnexpectedError(new Error(maybeLog.value.message))
        );
      }

      return right(maybeLog.value);
    } catch (err) {
      return left(new UnexpectedError(err, 'Getting recent logs failed'));
    }
  }
}
