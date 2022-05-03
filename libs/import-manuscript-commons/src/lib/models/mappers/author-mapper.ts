import { Mapper, Email } from '@hindawi/shared';

import { AuthorProps, Author } from '../author';

export interface RawAuthorProps {
  affiliationRorId?: string;
  affiliationRinggoldId: string;
  isCorresponding: boolean;
  affiliationName: string;
  isSubmitting: boolean;
  countryCode: string;
  givenName: string;
  surname: string;
  email: string;
}

export class AuthorMapper extends Mapper<Author> {
  static toDomain(raw: Partial<RawAuthorProps>): Author {
    const maybeEmail = Email.create({ value: raw.email });

    if (maybeEmail.isLeft()) {
      throw maybeEmail.value;
    }

    const props: AuthorProps = {
      affiliationRorId: raw.affiliationRorId || null,
      affiliationRinggoldId: raw.affiliationRinggoldId || null,
      isCorresponding: raw.isCorresponding || false,
      affiliationName: raw.affiliationName || '',
      isSubmitting: raw.isSubmitting || false,
      countryCode: raw.countryCode || null,
      givenName: raw.givenName || null,
      surname: raw.surname || null,
      email: maybeEmail.value,
    };

    return Author.create(props);
  }

  static toPersistance(author: Author): RawAuthorProps {
    return {
      affiliationRorId: author.affiliationRorId,
      affiliationRinggoldId: author.affiliationRinggoldId,
      isCorresponding: author.isCorresponding,
      affiliationName: author.affiliationName,
      isSubmitting: author.isSubmitting,
      countryCode: author.countryCode,
      email: author.email.toString(),
      givenName: author.givenName,
      surname: author.surname,
    };
  }
}
