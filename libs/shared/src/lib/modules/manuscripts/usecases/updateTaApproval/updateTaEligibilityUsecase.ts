// * Core Domain
import { UnexpectedError } from '../../../../core/logic/AppError';
import { left, right } from '../../../../core/logic/Either';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';
import { AccessControlContext, AccessControlledUsecase, Authorize } from '../../../../domain/authorization';

import { ArticleRepoContract } from '../../repos/articleRepo';

// * Usecase specific
import { UpdateTaEligibilityResponse as Response } from './updateTaEligibilityResponse';
import type { UpdateTaEligibilityDTO as DTO } from './updateTaEligibilityDTO';
import * as Errors from './updateTaEligibilityErrors';
import { VError } from 'verror';

export class UpdateTaEligibilityUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context>
{
  constructor(private articleRepo: ArticleRepoContract) {
    super();
  }

  @Authorize('invoice:update')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    try {
      const maybeUpdate = await this.articleRepo.updateManuscriptTAEligibility(
        request.manuscript.manuscriptId,
        request.isEligible
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
