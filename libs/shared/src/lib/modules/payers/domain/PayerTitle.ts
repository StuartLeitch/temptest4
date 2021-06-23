import { Either, right, left } from '../../../core/logic/Either';
import { GuardFailure } from '../../../core/logic/GuardFailure';
import { ValueObject } from '../../../core/domain/ValueObject';

interface PayerTitleProps {
  value: string;
}

export class PayerTitle extends ValueObject<PayerTitleProps> {
  get value(): string {
    return this.props.value;
  }

  private constructor(props: PayerTitleProps) {
    super(props);
  }

  public static create(title: string): Either<GuardFailure, PayerTitle> {
    if (!!title === false || title.length === 0) {
      return left(new GuardFailure('Must provide a payer title'));
    } else {
      return right(new PayerTitle({ value: title }));
    }
  }
}
