import {Either, Result} from '../../../../core/logic/Result';
import {AppError} from '../../../.././core/logic/AppError';

// import {UpvoteCommentErrors} from './UpvoteCommentErrors';
// import {UpvotePostErrors} from '../../post/upvotePost/UpvotePostErrors';

export type UpdateTransactionOnAcceptManuscriptResponse = Either<
  // | UpvotePostErrors.PostNotFoundError
  // | UpvoteCommentErrors.CommentNotFoundError
  // | UpvoteCommentErrors.MemberNotFoundError
  AppError.UnexpectedError | Result<any>,
  Result<void>
>;
