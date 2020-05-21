// * Core Domain
import { Result, left, right } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';
import { UseCase } from '../../../../core/domain/UseCase';

// * Usecase specific
import { InvoiceRepoContract } from '../../../invoices/repos';

// * Authorization Logic
import { AccessControlContext } from '../../../../domain/authorization/AccessControl';
import { Roles } from '../../../users/domain/enums/Roles';
import {
  AccessControlledUsecase,
  AuthorizationContext,
} from '../../../../domain/authorization/decorators/Authorize';

import { Payment } from './../../domain/Payment';
import { PaymentMap } from './../../mapper/Payment';
import { PaymentFactory } from './../../domain/strategies/PaymentFactory';
import { PaymentStrategy } from './../../domain/strategies/PaymentStrategy';
import { PaymentModel } from './../../domain/contracts/PaymentModel';
import { PaymentMethod } from './../../domain/PaymentMethod';

import { Migration } from './../../domain/strategies/Migration';
import { MigrationPayment } from './../../domain/strategies/MigrationPayment';

import { MigratePaymentResponse } from './migratePaymentResponse';
import { MigratePaymentErrors } from './migratePaymentErrors';
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
    const { invoiceId, payerId, amount, datePaid } = request;

    let paymentMethod: PaymentMethod;

    try {
      const migration = new Migration();
      const paymentFactory = new PaymentFactory();
      paymentFactory.registerPayment(migration);
      const paymentStrategy: PaymentStrategy = new PaymentStrategy([
        ['Migration', new MigrationPayment()],
      ]);
      const paymentModel: PaymentModel = paymentFactory.create(
        'MigrationPayment'
      );

      try {
        // * System identifies payment method by name
        paymentMethod = await this.paymentMethodRepo.getPaymentMethodByName(
          'Migration'
        );
      } catch (err) {
        return left(
          new MigratePaymentErrors.PaymentMethodNotFound('Migration')
        );
      }

      // Simulate payment processing
      await paymentStrategy.makePayment(paymentModel, amount);

      const rawPayment = {
        invoiceId,
        amount,
        datePaid,
        payerId,
        foreignPaymentId: '',
        paymentMethodId: paymentMethod.paymentMethodId.id.toString(),
      };

      const payment = PaymentMap.toDomain(rawPayment);

      await this.paymentRepo.save(payment);

      return right(Result.ok<Payment>(payment));
    } catch (err) {
      return left(new AppError.UnexpectedError(err));
    }
  }
}
