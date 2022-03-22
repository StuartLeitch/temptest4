import { Mapper } from '@hindawi/shared';

import { FileProps, FileType, File } from '../file';
import { Path } from '../path';

interface RawFileProps {
  name: string;
  path: string;
  size: number;
  type: string;
}

export class FileMapper extends Mapper<File> {
  static toDomain(raw: RawFileProps): File {
    const props: FileProps = {
      type: raw.type ? FileType[raw.type] : null,
      path: Path.create(raw.path),
      name: raw.name,
      size: raw.size,
    };

    return File.create(props);
  }

  static toPersistance(file: File): RawFileProps {
    return {
      path: file.path.src,
      name: file.name,
      size: file.size,
      type: file.type,
    };
  }
}
