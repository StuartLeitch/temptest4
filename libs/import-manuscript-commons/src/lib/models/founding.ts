import {
  ValueObjectProps,
  UniqueEntityID,
  GuardArgument,
  ValueObject,
  Guard,
} from '@hindawi/shared';

export interface FoundingProps extends ValueObjectProps {
  recipientName: string;
  founderName: string;
  id: UniqueEntityID;
  founderId: string;
}

export class Founding extends ValueObject<FoundingProps> {
  get founderId(): string {
    return this.props.founderId;
  }

  get recipientName(): string {
    return this.props.recipientName;
  }

  get founderName(): string {
    return this.props.founderName;
  }

  get id(): UniqueEntityID {
    return this.props.id;
  }

  private constructor(props: FoundingProps) {
    super(props);
  }

  static create(props: FoundingProps): Founding {
    const guardArgs: GuardArgument[] = [
      { argument: props.recipientName, argumentName: 'recipientName' },
      { argument: props.founderName, argumentName: 'founderName' },
      { argument: props.founderId, argumentName: 'founderId' },
      { argument: props.id, argumentName: 'id' },
    ];

    const guardResult = Guard.againstNullOrUndefinedBulk(guardArgs);

    if (guardResult.failed) {
      throw guardResult;
    }

    return new Founding(props);
  }
}
