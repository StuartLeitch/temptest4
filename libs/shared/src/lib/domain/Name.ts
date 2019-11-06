import {ValueObject} from '../core/domain/ValueObject';
import {Result} from '../core/logic/Result';
import {Guard} from '../core/logic/Guard';

interface NameProps {
  value: string;
}

export class Name extends ValueObject<NameProps> {
  get value(): string {
    return this.props.value;
  }

  private constructor(props: NameProps) {
    super(props);
  }

  public static create(props: NameProps): Result<Name> {
    const nullGuardResult = Guard.againstNullOrUndefined(name, 'name');

    if (!nullGuardResult.succeeded) {
      return Result.fail<Name>(nullGuardResult.message);
    }

    return Result.ok<Name>(new Name(props));
  }
}
