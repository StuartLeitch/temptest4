import { Either, right, left } from '../../../core/logic/Either';
import { GuardFailure } from '../../../core/logic/GuardFailure';
import { ValueObject } from '../../../core/domain/ValueObject';
import { Guard } from '../../../core/logic/Guard';

export interface InvoiceNumberProps {
  value: number;
}

export class InvoiceNumber extends ValueObject<InvoiceNumberProps> {
  get value(): number {
    return this.props.value;
  }

  private constructor(props: InvoiceNumberProps) {
    super(props);
  }

  public static create(
    props: InvoiceNumberProps
  ): Either<GuardFailure, InvoiceNumber> {
    const propsResult = Guard.againstNullOrUndefined(
      props.value,
      'invoiceNumber'
    );

    if (!propsResult.succeeded) {
      return left(new GuardFailure(propsResult.message));
    } else {
      return right(
        new InvoiceNumber({
          value: props.value,
        })
      );
    }
  }

  toString(): string {
    return this.value.toString();
  }
}
