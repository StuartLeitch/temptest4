import {
  ValueObjectProps,
  GuardArgument,
  ValueObject,
  Email,
  Guard,
} from '@hindawi/shared';

export interface AuthorProps extends ValueObjectProps {
  affiliationRorId?: string;
  affiliationRinggoldId: string;
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

  get affiliationRinggoldId(): string {
    return this.props.affiliationRinggoldId;
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
    return this.props.email;
  }

  private constructor(props: AuthorProps) {
    super(props);
  }

  static create(props: AuthorProps): Author {
    const guardArgs: GuardArgument[] = [
      {argument: props.affiliationName, argumentName: 'author.affiliationName'},
      {argument: props.isCorresponding, argumentName: 'author.isCorresponding'},
      {argument: props.isSubmitting, argumentName: 'author.isSubmitting'},
      {argument: props.countryCode, argumentName: 'author.countryCode'},
      {argument: props.givenName, argumentName: 'author.givenName'},
      {argument: props.surname, argumentName: 'author.surname'},
      {argument: props.email, argumentName: 'author.email'},
    ];

    Guard.againstNullOrUndefinedBulk(guardArgs).throwIfFailed();
    Guard.againstEmpty(props.givenName, 'author.givenName').throwIfFailed()
    Guard.againstEmpty(props.surname, 'author.surname').throwIfFailed()
    Guard.againstEmpty(props.email.value, 'author.email').throwIfFailed()
    Guard.againstEmpty(props.countryCode, 'author.country').throwIfFailed()
    Guard.againstEmpty(props.affiliationName, 'author.affiliationName').throwIfFailed()

    return new Author(props);
  }
}
