// * Core Domain
// import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { Result, left, right } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';
import { UseCase } from '../../../../core/domain/UseCase';

// import { chain } from '../../../../core/logic/EitherChain';
// import { map } from '../../../../core/logic/EitherMap';

// * Usecase specific
// import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import { InvoiceRepoContract } from '../../../invoices/repos';
// import { PayerId } from '../../../payers/domain/PayerId';
// import { Amount } from '../../../../domain/Amount';
// import { Payment } from '../../domain/Payment';

// * Authorization Logic
import { AccessControlContext } from '../../../../domain/authorization/AccessControl';
import { Roles } from '../../../users/domain/enums/Roles';
import {
  AccessControlledUsecase,
  AuthorizationContext
  // Authorize
} from '../../../../domain/authorization/decorators/Authorize';

import { PaymentFactory } from './../../domain/strategies/PaymentFactory';
import { PaymentStrategy } from './../../domain/strategies/PaymentStrategy';
import { PaymentModel } from './../../domain/contracts/PaymentModel';
import { Migration } from './../../domain/strategies/Migration';
import { MigrationPayment } from './../../domain/strategies/MigrationPayment';

import { MigratePaymentResponse } from './migratePaymentResponse';
// import { MigratePaymentErrors } from './migratePaymentErrors';
import { MigratePaymentDTO } from './migratePaymentDTO';
import { PaymentMethodRepoContract } from '../../repos';
import { PaymentRepoContract } from '../../repos/paymentRepo';

export type MigratePaymentContext = AuthorizationContext<Roles>;

export class MigratePaymentUsecase
  implements
    UseCase<
      MigratePaymentDTO,
      Promise<MigratePaymentResponse>,
      MigratePaymentContext
    >,
    AccessControlledUsecase<
      MigratePaymentDTO,
      MigratePaymentContext,
      AccessControlContext
    > {
  constructor(
    private paymentMethodRepo: PaymentMethodRepoContract,
    private paymentRepo: PaymentRepoContract,
    private invoiceRepo: InvoiceRepoContract
  ) {}

  public async execute(
    request: MigratePaymentDTO,
    context?: MigratePaymentContext
  ): Promise<MigratePaymentResponse> {
    try {
      const migration = new Migration();
      const paymentFactory = new PaymentFactory();
      paymentFactory.registerPayment(migration);
      const paymentStrategy: PaymentStrategy = new PaymentStrategy([
        ['Migration', new MigrationPayment()]
      ]);
      const paymentModel: PaymentModel = paymentFactory.create(
        'MigrationPayment'
      );

      // TODO: Create payment record and save it
      // const payment: any = await paymentStrategy.makePayment(
      //   paymentModel,
      //   payload.amount
      // );

      // await this.paymentRepo.save(payment);

      return right(Result.ok<void>());
    } catch (err) {
      return left(new AppError.UnexpectedError(err));
    }
  }
}
