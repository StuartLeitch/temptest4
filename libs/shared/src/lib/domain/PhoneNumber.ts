import { Either, right, left } from '../core/logic/Either';
import { GuardFailure } from '../core/logic/GuardFailure';
import { ValueObject } from '../core/domain/ValueObject';
import { Guard } from '../core/logic/Guard';

interface PhoneNumberProps {
  value: string;
}

export class PhoneNumber extends ValueObject<PhoneNumberProps> {
  get value(): string {
    return this.props.value;
  }

  private constructor(props: PhoneNumberProps) {
    super(props);
  }

  public static create(number: string): Either<GuardFailure, PhoneNumber> {
    const guardResult = Guard.againstNullOrUndefined(number, 'phone number');
    if (!guardResult.succeeded) {
      return left(new GuardFailure(guardResult.message));
    } else {
      return right(new PhoneNumber({ value: number }));
    }
  }
}
