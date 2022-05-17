import {
  ValueObjectProps,
  UniqueEntityID,
  GuardArgument,
  ValueObject,
  Guard, GuardFailure,
} from '@hindawi/shared';

import { SourceJournal, Journal } from './journal';
import { MecaFileType, File } from './file';
import { Founding } from './founding';
import { Author } from './author';
const { getName } = require('country-list');


export interface ManuscriptProps extends ValueObjectProps {
  sourceManuscriptId: UniqueEntityID;
  articleTypeName: string;
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

  get articleTypeName(): string {
    return this.props.articleTypeName;
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
    return this.files.filter(
      (file) => file.type === MecaFileType.supplementary
    );
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

  static create(manuscriptProps: ManuscriptProps): Manuscript {
    const guardArgs: GuardArgument[] = [
      { argument: manuscriptProps.sourceJournal, argumentName: 'sourceJournal' },
      { argument: manuscriptProps.title, argumentName: 'title' },
      { argument: manuscriptProps.conflictOfInterest, argumentName: 'conflictOfInterest' },
      { argument: manuscriptProps.articleAbstract, argumentName: 'articleAbstract' },
      { argument: manuscriptProps.articleTypeName, argumentName: 'articleTypeName' },
      { argument: manuscriptProps.authors, argumentName: 'authors' },
      { argument: manuscriptProps.files, argumentName: 'files' },
      {
        argument: manuscriptProps.destinationJournal,
        argumentName: 'destinationJournal',
      },
      {
        argument: manuscriptProps.sourceManuscriptId,
        argumentName: 'sourceManuscriptId',
      },
    ];

    const guardResult = Guard.againstNullOrUndefinedBulk(guardArgs);

    if (guardResult.failed) {
      throw guardResult;
    }

    if(!manuscriptProps.authors.find(a => a.isCorresponding)){
      throw new GuardFailure(`The manuscript ${manuscriptProps.title} does not have a corresponding author`)
    }

    if(!manuscriptProps.authors.find(a => a.isSubmitting)){
      throw new GuardFailure(`The manuscript ${manuscriptProps.title} does not have a submitting author`)
    }

    for (const author of manuscriptProps.authors) {
      const authorGuardArgs: GuardArgument[] = [
        { argument: author.givenName, argumentName: 'givenName' },
        { argument: author.surname, argumentName: 'surname' },
        { argument: author.email, argumentName: 'email' },
        { argument: author.countryCode, argumentName: 'country' },
        { argument: author.affiliationName, argumentName: 'affiliationName' },
        { argument: author.affiliationRorId, argumentName: 'affiliationRorId' },
      ];

      const authorGuardResult = Guard.againstNullOrUndefinedBulk(authorGuardArgs);
      if (authorGuardResult.failed) {
        throw authorGuardResult;
      }

      if(!getName(author.countryCode)){
        throw new GuardFailure(`The country code ${author.countryCode} for author ${author.givenName} ${author.surname} does not exist on this planet.`)
      }
    }

    return new Manuscript(manuscriptProps);
  }
}
