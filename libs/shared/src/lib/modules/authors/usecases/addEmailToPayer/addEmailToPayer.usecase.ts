/* eslint-disable @typescript-eslint/no-unused-vars */
import { UseCase } from '../../../../core/domain/UseCase';
import { Result } from '../../../../core/logic/Result';
import { Email } from '../../../../domain/Email';

// * Authorization Logic
import type { UsecaseAuthorizationContext } from '../../../../domain/authorization';

export interface AddEmailToPayerUseCaseRequestDTO {
  payerId: string;
}

export class AddEmailToPayerUseCase
  implements
    UseCase<
      AddEmailToPayerUseCaseRequestDTO,
      Result<Email>,
      UsecaseAuthorizationContext
    > {
  // @Authorize([Roles.ADMIN, Roles.SUPER_ADMIN, Roles.CUSTOMER])
  public async execute(
    request: AddEmailToPayerUseCaseRequestDTO
  ): Promise<Result<Email>> {
    const email: Email = null;

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
