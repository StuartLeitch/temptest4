// * Core Domain
import { AggregateRoot } from '../../../../shared/src/lib/core/domain/AggregateRoot';
import { UniqueEntityID } from '../../../../shared/src/lib/core/domain/UniqueEntityID';
import { Result } from '../../../../shared/src/lib/core/logic/Result';

// * Subdomains
// import { TenantId } from './TenantId';

interface ConstraintProps {
  name: string;
  value: string;
  type: string;
  description?: string;
}

export class Constraint extends AggregateRoot<ConstraintProps> {
  get description(): string {
    return this.props.description;
  }

  set description(description: string) {
    this.props.description = description;
  }

  get name(): string {
    return this.props.name;
  }

  private constructor(props: ConstraintProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(
    props: ConstraintProps,
    id?: UniqueEntityID
  ): Result<Constraint> {
    const defaultValues = {
      ...props
    };

    const constraint = new Constraint(defaultValues, id);

    return Result.ok<Constraint>(constraint);
  }

  public toString(): string {
    const { type, description, name, value } = this.props;
    return `Constraint[type=${type} name=${name} value=${value} description=${description}]`;
  }
}
