import {ValueObject} from '../../../core/domain/ValueObject';
import {Result} from '../../../core/logic/Result';

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

  public static create(title: string): Result<PayerTitle> {
    if (!!title === false || title.length === 0) {
      return Result.fail<PayerTitle>('Must provide a payer title');
    } else {
      return Result.ok<PayerTitle>(new PayerTitle({value: title}));
    }
  }
}
