import { Result } from '../../../core/logic/Result';
import { ValueObject } from '../../../core/domain/ValueObject';
import { Guard } from './../../../core/logic/Guard';

export interface InvoiceNumberProps {
  value: number;
}

export class InvoiceNumber extends ValueObject<InvoiceNumberProps> {
  public static minLength: number = 6;

  get value () : number {
    return this.props.value;
  }

  private constructor (props: InvoiceNumberProps) {
    super(props);
  }

  private static isAppropriateLength (value: number): boolean {
    return String(value).length >= this.minLength;
  }

  public static create (props: InvoiceNumberProps): Result<InvoiceNumber> {
    const propsResult = Guard.againstNullOrUndefined(props.value, 'invoiceNumber');

    if (!propsResult.succeeded) {
      return Result.fail<InvoiceNumber>(propsResult.message);
    } else {

      if (!props.value) {
        if (
          !this.isAppropriateLength(props.value)
        ) {
          return Result.fail<InvoiceNumber>('Invoice number doesn\'t meet criteria [6 chars min].');
        }
      }

      return Result.ok<InvoiceNumber>(new InvoiceNumber({
        value: props.value
      }));
    }
  }

  toString(): string {
    return this.value.toString();
  }
}
