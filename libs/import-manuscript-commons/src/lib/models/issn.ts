import {
  ValueObjectProps,
  GuardArgument,
  ValueObject,
  Guard,
} from '@hindawi/shared';

export enum IssnType {
  eISSN = 'eISSN',
  ISSN = 'ISSN',
}
export interface IssnProps extends ValueObjectProps {
  value: string;
  type: IssnType;
}

export class Issn extends ValueObject<IssnProps> {
  get value(): string {
    return this.props.value;
  }

  get type(): IssnType {
    return this.props.type;
  }

  private constructor(props: IssnProps) {
    super(props);
  }

  static create(props: IssnProps): Issn {
    const guardArgs: GuardArgument[] = [
      { argument: props.value, argumentName: 'issn value' },
      { argument: props.type, argumentName: 'issn type' },
    ];

    const finalResult = Guard.combineResults([
      Guard.againstNullOrUndefinedBulk(guardArgs),
      Guard.againstInvalidIssn(props.value),
    ]);

    if (finalResult.failed) {
      throw finalResult;
    }

    return new Issn(props);
  }
}
