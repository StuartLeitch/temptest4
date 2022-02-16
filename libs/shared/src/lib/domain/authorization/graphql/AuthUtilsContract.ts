import { Either, UseCaseError } from '../../../core/logic';

type UsecaseResponse = Either<UseCaseError, unknown>;

export interface GraphqlAuthUtils<Context, Roles> {
  handleForbiddenUsecase(result: UsecaseResponse): void | never;
  getAuthRoles(
    context: Context,
    possibleRoles: Array<string>
  ): Array<Roles> | never;
}
