import {
  ValueObjectProps,
  GuardArgument,
  ValueObject,
  Email,
  Guard,
} from '@hindawi/shared';

export interface AuthorProps extends ValueObjectProps {
  affiliationRorId?: string;
  isCorresponding: boolean;
  affiliationName: string;
  isSubmitting: boolean;
  countryCode: string;
  givenName: string;
  surname: string;
  email: Email;
}

export class Author extends ValueObject<AuthorProps> {
  get affiliationName(): string {
    return this.props.affiliationName;
  }

  get affiliationRorId(): string | null {
    return this.props.affiliationRorId || null;
  }

  get isCorresponding(): boolean {
    return this.props.isCorresponding;
  }

  get isSubmitting(): boolean {
    return this.props.isSubmitting;
  }

  get givenName(): string {
    return this.props.givenName;
  }

  get surname(): string {
    return this.props.surname;
  }

  get countryCode(): string {
    return this.props.countryCode;
  }

  get email(): Email {
    return this.props.Email;
  }

  private constructor(props: AuthorProps) {
    super(props);
  }

  static create(props: AuthorProps): Author {
    const guardArgs: GuardArgument[] = [
      { argument: props.affiliationName, argumentName: 'affiliationName' },
      { argument: props.isCorresponding, argumentName: 'isCorresponding' },
      { argument: props.isSubmitting, argumentName: 'isSubmitting' },
      { argument: props.countryCode, argumentName: 'countryCode' },
      { argument: props.givenName, argumentName: 'givenName' },
      { argument: props.surname, argumentName: 'surname' },
      { argument: props.email, argumentName: 'email' },
    ];

    const guardResult = Guard.againstNullOrUndefinedBulk(guardArgs);

    if (guardResult.failed) {
      throw guardResult;
    }

    return new Author(props);
  }
}
