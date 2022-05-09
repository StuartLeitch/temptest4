import { Mapper } from '@hindawi/shared';
import {
  SubmissionFile,
  SubmissionFileProps,
} from '../submission-system-models/file-submission';

export interface RawSubmissionFileProps {
  id: string;
  name: string;
  size: number;
  type: string;
}

export class SubmissionSystemFileMapper extends Mapper<SubmissionFile> {
  static toDomain(raw: Partial<RawSubmissionFileProps>): SubmissionFile {
    console.log(raw);
    const props: SubmissionFileProps = {
      id: raw.id,
      name: raw.name,
      size: raw.size,
      type: raw.type,
    };
    return SubmissionFile.create(props);
  }

  static toPersistance(file: SubmissionFile): SubmissionFileProps {
    return {
      id: file.id,
      name: file.name,
      size: file.size,
      type: file.type,
    };
  }
}
