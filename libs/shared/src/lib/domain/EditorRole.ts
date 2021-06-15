import { Either, right, left } from '../core/logic/Either';
import { GuardFailure } from '../core/logic/GuardFailure';
import { ValueObject } from '../core/domain/ValueObject';
import { Guard } from '../core/logic/Guard';

interface EditorRoleProps {
  label: string;
  type: string;
}

export class EditorRole extends ValueObject<EditorRoleProps> {
  get label(): string {
    return this.props.label;
  }

  get type(): string {
    return this.props.type;
  }

  private constructor(props: EditorRoleProps) {
    super(props);
  }

  public static create(
    props: EditorRoleProps
  ): Either<GuardFailure, EditorRole> {
    const nullGuard = Guard.againstNullOrUndefinedBulk([
      { argument: props.type, argumentName: 'type' },
    ]);

    if (!nullGuard.succeeded) {
      return left(new GuardFailure(nullGuard.message));
    }

    return right(
      new EditorRole({
        ...props,
      })
    );
  }
}
