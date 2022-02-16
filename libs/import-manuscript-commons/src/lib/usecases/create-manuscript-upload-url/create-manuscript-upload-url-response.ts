import { UnexpectedError, Either } from '@hindawi/shared';

export type CreateManuscriptUploadUrlResponse = Either<UnexpectedError, string>;
