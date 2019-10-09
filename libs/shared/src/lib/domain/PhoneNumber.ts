import {ValueObject} from '../core/domain/ValueObject';
import {Result} from '../core/logic/Result';
import {Guard} from '../core/logic/Guard';

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

  public static create(number: string): Result<PhoneNumber> {
    const guardResult = Guard.againstNullOrUndefined(number, 'phone number');
    if (!guardResult.succeeded) {
      return Result.fail<PhoneNumber>(guardResult.message);
    } else {
      return Result.ok<PhoneNumber>(new PhoneNumber({value: number}));
    }
  }
}
