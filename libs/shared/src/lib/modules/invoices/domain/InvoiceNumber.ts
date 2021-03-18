import { Result } from '../../../core/logic/Result';
import { ValueObject } from '../../../core/domain/ValueObject';
import { Guard } from './../../../core/logic/Guard';

export interface InvoiceNumberProps {
  value: number;
}

export class InvoiceNumber extends ValueObject<InvoiceNumberProps> {
  get value () : number {
    return this.props.value;
  }

  private constructor (props: InvoiceNumberProps) {
    super(props);
  }

  public static create (props: InvoiceNumberProps): Result<InvoiceNumber> {
    const propsResult = Guard.againstNullOrUndefined(props.value, 'invoiceNumber');

    if (!propsResult.succeeded) {
      return Result.fail<InvoiceNumber>(propsResult.message);
    } else {
      return Result.ok<InvoiceNumber>(new InvoiceNumber({
        value: props.value
      }));
    }
  }

  toString(): string {
    return this.value.toString();
  }
}
