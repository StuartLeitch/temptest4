import {ValueObject} from '../core/domain/ValueObject';
import {Result} from '../core/logic/Result';
import {Guard} from '../core/logic/Guard';

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

  public static create(src: string, name: string): Result<File> {
    const guardResult = Guard.againstNullOrUndefined(src, 'source');
    if (!guardResult.succeeded) {
      return Result.fail<File>(guardResult.message);
    } else {
      return Result.ok<File>(new File({src, name}));
    }
  }
}
