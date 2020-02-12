// * Core Domain
import { AggregateRoot } from '../../../../shared/src/lib/core/domain/AggregateRoot';
import { UniqueEntityID } from '../../../../shared/src/lib/core/domain/UniqueEntityID';
import { Result } from '../../../../shared/src/lib/core/logic/Result';

// * Subdomains
// import { TenantId } from './TenantId';

interface GroupProps {
  name: string;
  description?: string;
}

export class Group extends AggregateRoot<GroupProps> {
  get description(): string {
    return this.props.description;
  }

  set description(description: string) {
    this.props.description = description;
  }

  get name(): string {
    return this.props.name;
  }

  private constructor(props: GroupProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(props: GroupProps, id?: UniqueEntityID): Result<Group> {
    const defaultValues = {
      ...props
    };

    const group = new Group(defaultValues, id);

    return Result.ok<Group>(group);
  }
}
