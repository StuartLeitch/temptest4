import { UnexpectedError } from '../../../../../core/logic/AppError';
import { Either } from '../../../../../core/logic/Either';

import { Editor } from '../../../domain/Editor';

export type GetEditorsByJournalResponse = Either<UnexpectedError, Editor[]>;
