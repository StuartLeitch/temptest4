// * Core Domain
import { AggregateRoot } from '../../../../shared/src/lib/core/domain/AggregateRoot';
import { UniqueEntityID } from '../../../../shared/src/lib/core/domain/UniqueEntityID';
import { Result } from '../../../../shared/src/lib/core/logic/Result';

// * Subdomains
import { Constraint } from './Constraint';
import { Constraints } from './Constraints';

interface PermissionProps {
  name: string;
  description?: string;
  constraints: Constraints;
}

export class Permission extends AggregateRoot<PermissionProps> {
  get description(): string {
    return this.props.description;
  }

  set description(description: string) {
    this.props.description = description;
  }

  set constraints(constraints: Constraints) {
    this.props.constraints = constraints;
  }

  get name(): string {
    return this.props.name;
  }

  private constructor(props: PermissionProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(
    props: PermissionProps,
    id?: UniqueEntityID
  ): Result<Permission> {
    const defaultValues = {
      ...props,
      constraints: props.constraints
        ? props.constraints
        : Constraints.create([])
    };

    const permission = new Permission(defaultValues, id);

    return Result.ok<Permission>(permission);
  }

  public enforce(constraint: Constraint): void {
    this.props.constraints.add(constraint);
  }

  public forget(constraint: Constraint): void {
    this.props.constraints.remove(constraint);
  }

  public constraintOf(name: string): Constraint {
    for (const constraint of this.props.constraints.getItems()) {
      if (constraint.name === name) {
        return constraint;
      }
    }
    return null;
  }

  public toString(): string {
    const { name, description, constraints } = this.props;
    return `Permission[name=${name} description=${description} constraints=${constraints.getItems()}]`;
  }
}
