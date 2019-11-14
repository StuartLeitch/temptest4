// * Core Domain
import {Result, left, right} from '../../../../core/logic/Result';
import {UniqueEntityID} from '../../../../core/domain/UniqueEntityID';
import {AppError} from '../../../../core/logic/AppError';
import {UseCase} from '../../../../core/domain/UseCase';

// * Authorization Logic
import {AccessControlContext} from '../../../../domain/authorization/AccessControl';
import {Roles} from '../../../users/domain/enums/Roles';
import {
  AccessControlledUsecase,
  AuthorizationContext,
  Authorize
} from '../../../../domain/authorization/decorators/Authorize';

import {PayerRepoContract} from '../../repos/payerRepo';
import {PayerType, Payer} from '../../domain/Payer';
import {PayerId} from '../../domain/PayerId';

// * Usecase specific
import {GetPayerDetailsResponse} from './getPayerDetailsResponse';
import {GetPayerDetailsErrors} from './getPayerDetailsErrors';
import {GetPayerDetailsDTO} from './getPayerDetailsDTO';

import {PayerMap} from '../../mapper/Payer';

export type GetPayerDetailsContext = AuthorizationContext<Roles>;

export class GetPayerDetailsUsecase
  implements
    UseCase<
      GetPayerDetailsDTO,
      Promise<GetPayerDetailsResponse>,
      GetPayerDetailsContext
    >,
    AccessControlledUsecase<
      GetPayerDetailsDTO,
      GetPayerDetailsContext,
      AccessControlContext
    > {
  constructor(private payerRepo: PayerRepoContract) {}

  public async execute(
    request: GetPayerDetailsDTO,
    context?: GetPayerDetailsContext
  ): Promise<GetPayerDetailsResponse> {
    return Promise.resolve(
      right(
        Result.ok(
          PayerMap.toDomain({
            id: 'payer-1',
            type: PayerType.INDIVIDUAL,
            name: 'Darth Vader',
            invoiceId: '40ec4344-d2c9-48f9-ad82-cbf101b9e9a1'
          })
        )
      )
    );
  }
}
