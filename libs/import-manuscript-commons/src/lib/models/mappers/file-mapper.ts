import { Mapper } from '@hindawi/shared';

import { FileProps, MecaFileType, File } from '../file';
import { Path } from '../path';

export interface RawFileProps {
  name: string;
  path: string;
  size: number;
  type: MecaFileType;
}

export class FileMapper extends Mapper<File> {
  static toDomain(raw: RawFileProps): File {
    const props: FileProps = {
      type: <MecaFileType>raw.type,
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
