import {
  ValueObjectProps,
  UniqueEntityID,
  GuardArgument,
  ValueObject,
  Guard,
} from '@hindawi/shared';

import { SourceJournal, Journal } from './journal';
import { MecaFileType, File } from './file';
import { Founding } from './founding';
import { Author } from './author';

export interface ManuscriptProps extends ValueObjectProps {
  sourceManuscriptId: UniqueEntityID;
  articleTypeId: UniqueEntityID;
  destinationJournal: Journal;
  articleAbstract: string;
  authors: Array<Author>;
  sourceJournal: SourceJournal;
  files: Array<File>;
  title: string;

  conflictOfInterest?: string;
  dataAvailability?: string;
  preprintValue?: string;
  founding?: Founding;
}

export class Manuscript extends ValueObject<ManuscriptProps> {
  get sourceManuscriptId(): UniqueEntityID {
    return this.props.sourceManuscriptId;
  }

  get articleTypeId(): UniqueEntityID {
    return this.props.articleTypeId;
  }

  get destinationJournal(): Journal {
    return this.props.destinationJournal;
  }

  get articleAbstract(): string {
    return this.props.articleAbstract;
  }

  get authors(): Array<Author> {
    return this.props.authors;
  }

  get correspondingAuthor(): Author {
    return this.authors.find((author) => author.isCorresponding);
  }

  get submittingAuthor(): Author {
    return this.authors.find((author) => author.isSubmitting);
  }

  get sourceJournal(): SourceJournal {
    return this.props.sourceJournal;
  }

  get files(): Array<File> {
    return this.props.files;
  }

  get manuscriptFiles(): Array<File> {
    return this.files.filter((file) => file.type === MecaFileType.manuscript);
  }

  get coverLetterFiles(): Array<File> {
    return this.files.filter((file) => file.type === MecaFileType.coverLetter);
  }

  get supplementaryFiles(): Array<File> {
    return this.files.filter((file) => file.type === MecaFileType.supplementary);
  }

  get title(): string {
    return this.props.title;
  }

  get conflictOfInterest(): string | null {
    return this.props.conflictOfInterest || null;
  }

  get founding(): Founding | null {
    return this.props.founding || null;
  }

  get dataAvailability(): string | null {
    return this.props.dataAvailability || null;
  }

  get preprintValue(): string | null {
    return this.props.preprintValue || null;
  }

  private constructor(props: ManuscriptProps) {
    super(props);
  }

  static create(props: ManuscriptProps): Manuscript {
    const guardArgs: GuardArgument[] = [
      { argument: props.articleAbstract, argumentName: 'articleAbstract' },
      { argument: props.articleTypeId, argumentName: 'articleTypeId' },
      { argument: props.sourceJournal, argumentName: 'sourceJournal' },
      { argument: props.authors, argumentName: 'authors' },
      { argument: props.files, argumentName: 'files' },
      { argument: props.title, argumentName: 'title' },
      {
        argument: props.destinationJournal,
        argumentName: 'destinationJournal',
      },
      {
        argument: props.sourceManuscriptId,
        argumentName: 'sourceManuscriptId',
      },
    ];

    const guardResult = Guard.againstNullOrUndefinedBulk(guardArgs);

    if (guardResult.failed) {
      throw guardResult;
    }

    return new Manuscript(props);
  }
}
