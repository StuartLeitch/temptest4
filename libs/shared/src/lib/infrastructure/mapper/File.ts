import { File } from '../../domain/File';
import { Mapper } from '../Mapper';

export interface FilePersistenceDTO {
  src: string;
  name?: string;
  size?: number;
  type?: string;
  metadata?: Record<string, string>;
}

export class FileMap extends Mapper<File> {
  public static toDomain(raw: FilePersistenceDTO): File {
    const result = File.create(raw.src, raw.name);

    // if (result.isFailure) {
    //   console.log(result);
    // }

    return result.isRight() ? result.value : null;
  }

  public static toPersistence(file: File): FilePersistenceDTO {
    return {
      src: file.src,
      name: file.name,
    };
  }
}
