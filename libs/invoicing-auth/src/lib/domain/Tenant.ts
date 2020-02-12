// * Core Domain
import { AggregateRoot } from '../../../../shared/src/lib/core/domain/AggregateRoot';
import { UniqueEntityID } from '../../../../shared/src/lib/core/domain/UniqueEntityID';
import { Result } from '../../../../shared/src/lib/core/logic/Result';

// * Subdomains
import { TenantId } from './TenantId';

interface TenantProps {
  name: string;
  description?: string;
  active: boolean;
}

export class Tenant extends AggregateRoot<TenantProps> {
  get tenantId(): TenantId {
    return TenantId.create(this._id).getValue();
  }

  get description(): string {
    return this.props.description;
  }

  set description(description: string) {
    this.props.description = description;
  }

  get name(): string {
    return this.props.name;
  }

  private constructor(props: TenantProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(
    props: TenantProps,
    id?: UniqueEntityID
  ): Result<Tenant> {
    const defaultValues = {
      ...props
    };

    const tenant = new Tenant(defaultValues, id);

    return Result.ok<Tenant>(tenant);
  }

  public activate(): void {
    this.props.active = true;
  }

  public deactivate(): void {
    this.props.active = false;
  }

  public isActive(): boolean {
    return this.props.active;
  }

  public changeName(newName: string): void {
    this.props.name = newName;
  }

  public doesNotExist(): boolean {
    return this.tenantId.equals(null);
  }
}
