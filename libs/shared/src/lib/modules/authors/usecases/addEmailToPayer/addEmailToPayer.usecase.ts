import {UseCase} from '../../../../core/domain/UseCase';
import {Result} from '../../../../core/logic/Result';
import {Email} from '../../../../domain/Email';
import {Payer} from '../../../payers/domain/Payer';

import {AuthorizationContext} from '../../../../domain/authorization/decorators/Authorize';
import {Roles} from '../../../users/domain/enums/Roles';

export interface AddEmailToPayerUseCaseRequestDTO {
  payerId: string;
}

export type AddEmailToPayerContext = AuthorizationContext<Roles>;

export class AddEmailToPayerUseCase
  implements
    UseCase<
      AddEmailToPayerUseCaseRequestDTO,
      Result<Email>,
      AddEmailToPayerContext
    > {
  constructor() {}

  // @Authorize([Roles.ADMIN, Roles.SUPER_ADMIN, Roles.CUSTOMER])
  public async execute(
    request: AddEmailToPayerUseCaseRequestDTO
  ): Promise<Result<Email>> {
    const {payerId} = request;

    let payer: Payer;
    let email: Email;

    try {
      // const payerOrError = await this.getPayer(request);
      // if (payerOrError.isFailure) {
      //   return Result.fail<Email>(payerOrError.error);
      // } else {
      //   payer = payerOrError.getValue();
      // }

      // const emailOrError = Email.create({
      //   // payerId: PayerId.create(new UniqueEntityID(payerId))
      // });

      // if (emailOrError.isFailure) {
      //   return Result.fail<Email>(emailOrError.error);
      // }

      // const email = emailOrError.getValue();

      return Result.ok<Email>(email);
    } catch (err) {
      console.log(err);
      return Result.fail<Email>(err);
    }
  }
}
