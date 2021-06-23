import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { GuardFailure } from '../../../core/logic/GuardFailure';
import { Mapper } from '../../../infrastructure/Mapper';
import { Either } from '../../../core/logic/Either';

import { PaymentMethod } from '../domain/PaymentMethod';

export interface PaymentMethodPersistenceDTO {
  id: string;
  name: string;
  isActive: boolean;
}

export class PaymentMethodMap extends Mapper<PaymentMethod> {
  public static toDomain(
    raw: PaymentMethodPersistenceDTO
  ): Either<GuardFailure, PaymentMethod> {
    const paymentMethodOrError = PaymentMethod.create(
      {
        name: raw.name,
        isActive: !!raw.isActive,
      },
      new UniqueEntityID(raw.id)
    );

    return paymentMethodOrError;
  }

  public static toPersistence(
    paymentMethod: PaymentMethod
  ): PaymentMethodPersistenceDTO {
    return {
      id: paymentMethod.id.toString(),
      name: paymentMethod.name,
      isActive: paymentMethod.isActive,
    };
  }
}
