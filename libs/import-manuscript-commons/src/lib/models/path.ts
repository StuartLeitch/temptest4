import { join } from 'path';

import {
  ValueObjectProps,
  GuardFailure,
  ValueObject,
  Guard,
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

  static create(src: string): Path {
    const guardResult = Guard.againstNullOrUndefined(src, 'source');
    if (guardResult.isFail()) {
      throw new GuardFailure(guardResult.message);
    } else {
      return new Path({ src });
    }
  }

  prefix(...paths: Array<string | Path>): Path {
    const p = paths.map((i) => (typeof i === 'string' ? i : i.src));
    return Path.create(join(...p, this.src));
  }

  join(...paths: Array<string | Path>): Path {
    const p = paths.map((i) => (typeof i === 'string' ? i : i.src));

    return Path.create(join(this.src, ...p));
  }
}
