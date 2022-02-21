import {
  ValueObjectProps,
  GuardFailure,
  ValueObject,
  Either,
  Guard,
  right,
  left,
} from '@hindawi/shared';

import { Path } from './path';

export enum FileType {
  supplementary = 'supplementary',
  coverLetter = 'coverLetter',
  manuscript = 'manuscript',
}

interface FileProps extends ValueObjectProps {
  name: string;
  size: number;
  type: FileType;
  path: Path;
}

export class File extends ValueObject<FileProps> {
  get name(): string {
    return this.props.name;
  }

  get size(): number {
    return this.props.size;
  }

  get type(): FileType {
    return this.props.type;
  }

  get path(): Path {
    return this.props.path;
  }

  private constructor(props: FileProps) {
    super(props);
  }

  static create(props: FileProps): Either<GuardFailure, File> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.name, argumentName: 'name' },
      { argument: props.path, argumentName: 'path' },
      { argument: props.size, argumentName: 'size' },
      { argument: props.type, argumentName: 'type' },
    ]);

    if (guardResult.isFail()) {
      return left(new GuardFailure(guardResult.message));
    } else {
      return right(new File(props));
    }
  }
}
