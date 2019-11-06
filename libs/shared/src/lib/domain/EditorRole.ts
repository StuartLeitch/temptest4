import {ValueObject} from '../core/domain/ValueObject';
import {Result} from '../core/logic/Result';
import {Guard} from '../core/logic/Guard';

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

  public static create(props: EditorRoleProps): Result<EditorRole> {
    const nullGuard = Guard.againstNullOrUndefinedBulk([
      {argument: props.label, argumentName: 'label'},
      {argument: props.type, argumentName: 'type'}
    ]);

    if (!nullGuard.succeeded) {
      return Result.fail<EditorRole>(nullGuard.message);
    }

    return Result.ok<EditorRole>(
      new EditorRole({
        ...props
      })
    );
  }
}
