import { Either, right, left } from '../core/logic/Either';
import { GuardFailure } from '../core/logic/GuardFailure';
import { ValueObject } from '../core/domain/ValueObject';
import { Guard } from '../core/logic/Guard';

interface FileProps {
  src: string;
  name?: string;
  size?: number;
  type?: string;
  metadata?: Record<string, string>;
}

export class File extends ValueObject<FileProps> {
  get src(): string {
    return this.props.src;
  }

  get name(): string {
    return this.props.name;
  }

  private constructor(props: FileProps) {
    super(props);
  }

  public static create(src: string, name: string): Either<GuardFailure, File> {
    const guardResult = Guard.againstNullOrUndefined(src, 'source');
    if (!guardResult.succeeded) {
      return left(new GuardFailure(guardResult.message));
    } else {
      return right(new File({ src, name }));
    }
  }
}
