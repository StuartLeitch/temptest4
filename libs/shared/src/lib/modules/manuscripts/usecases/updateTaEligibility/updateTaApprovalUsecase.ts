// * Core Domain
import { UnexpectedError } from '../../../../core/logic/AppError';
import { left, right } from '../../../../core/logic/Either';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';
import { AccessControlContext, AccessControlledUsecase, Authorize } from '../../../../domain/authorization';

import { ArticleRepoContract } from '../../repos/articleRepo';

// * Usecase specific
import { UpdateTaApprovalResponse as Response } from './updateTaApprovalResponse';
import type { UpdateTaApprovalDTO as DTO } from './updateTaApprovalDTO';
import * as Errors from './updateTaApprovalErrors';
import { VError } from 'verror';

export class UpdateTaApprovalUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context>
{
  constructor(private articleRepo: ArticleRepoContract) {
    super();
  }

  @Authorize('invoice:update')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    try {
      const maybeUpdate = await this.articleRepo.updateManuscriptTAApproval(
        request.manuscript.manuscriptId,
        request.isApproved
      );

      if (maybeUpdate.isLeft()) {
        return left(new Errors.EligibilityNotUpdated());
      }

      return right(null);
    } catch (err) {
      return left(new VError(new UnexpectedError(err), err.message));
    }
  }
}
