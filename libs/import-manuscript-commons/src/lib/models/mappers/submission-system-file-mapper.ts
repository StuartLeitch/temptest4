import { Mapper } from '../../../../../shared/src/lib/infrastructure';
import {
  SubmissionFile,
  SubmissionFileProps,
} from '../submission-system-models/file-submission';

export interface RawSubmissionFileProps {
  id: string;
}

export class SubmissionSystemFileMapper extends Mapper<SubmissionFile> {
  static toDomain(raw: Partial<RawSubmissionFileProps>): SubmissionFile {
    console.log(raw);
    const props: SubmissionFileProps = {
      id: raw.id,
    };
    return SubmissionFile.create(props);
  }

  static toPersistance(file: SubmissionFile): SubmissionFileProps {
    return {
      id: file.id,
    };
  }
}
