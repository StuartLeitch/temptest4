// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { AppError } from '../../../../core/logic/AppError';
import { Result, left, right } from '../../../../core/logic/Result';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';

// * Authorization Logic
import {
  Authorize,
  AuthorizationContext,
  AccessControlledUsecase
} from '../../../../domain/authorization/decorators/Authorize';
import { AccessControlContext } from '../../../../domain/authorization/AccessControl';
import { Roles } from '../../../users/domain/enums/Roles';

import { Notification } from '../../domain/Notification';
import { SentNotificationRepoContract } from '../../repos/SentNotificationRepo';

// * Usecase specific
import { SendInvoiceConfirmationReminderResponse as Response } from './SendInvoiceConfirmationReminderResponse';
import { SendInvoiceConfirmationReminderErrors as Errors } from './SendInvoiceConfirmationReminderErrors';
import { SendInvoiceConfirmationReminderDTO as DTO } from './SendInvoiceConfirmationReminderDTO';

type Context = AuthorizationContext<Roles>;
export type SendInvoiceConfirmationReminderContext = Context;

export class SendInvoiceConfirmationReminderUsecase
  implements
    UseCase<DTO, Promise<Response>, Context>,
    AccessControlledUsecase<DTO, Context, AccessControlContext> {
  constructor(private sentNotificationRepo: SentNotificationRepoContract) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  // @Authorize('invoice:read')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    return null;
  }
}
