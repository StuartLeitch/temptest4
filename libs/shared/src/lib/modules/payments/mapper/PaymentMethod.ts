import {UniqueEntityID} from '../../../core/domain/UniqueEntityID';
import {Mapper} from '../../../infrastructure/Mapper';
import {PaymentMethod} from '../domain/PaymentMethod';

export interface PaymentMethodPersistenceDTO {
  id: string;
  name: string;
  isActive: boolean;
}

export class PaymentMethodMap extends Mapper<PaymentMethod> {
  public static toDomain(raw: PaymentMethodPersistenceDTO): PaymentMethod {
    const paymentMethodOrError = PaymentMethod.create(
      {
        name: raw.name,
        isActive: !!raw.isActive
      },
      new UniqueEntityID(raw.id)
    );

    paymentMethodOrError.isFailure ? console.log(paymentMethodOrError) : '';

    return paymentMethodOrError.isSuccess
      ? paymentMethodOrError.getValue()
      : null;
  }

  public static toPersistence(
    paymentMethod: PaymentMethod
  ): PaymentMethodPersistenceDTO {
    return {
      id: paymentMethod.id.toString(),
      name: paymentMethod.name,
      isActive: paymentMethod.isActive
    };
  }
}
