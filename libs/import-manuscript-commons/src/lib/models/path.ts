import {
  ValueObjectProps,
  GuardFailure,
  ValueObject,
  Either,
  Guard,
  right,
  left,
} from '@hindawi/shared';

interface PathProps extends ValueObjectProps {
  src: string;
}

export class Path extends ValueObject<PathProps> {
  get src(): string {
    return this.props.src;
  }

  private constructor(props: PathProps) {
    super(props);
  }

  static create(src: string): Either<GuardFailure, Path> {
    const guardResult = Guard.againstNullOrUndefined(src, 'source');
    if (guardResult.isFail()) {
      return left(new GuardFailure(guardResult.message));
    } else {
      return right(new Path({ src }));
    }
  }
}
