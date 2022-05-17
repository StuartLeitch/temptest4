import { UniqueEntityID } from '@hindawi/shared';

import { Manuscript, File } from '../../models';
import { ActiveJournal } from '../../models/submission-system-models/active-journal';
import { SourceJournal } from '../../models/submission-system-models/source-journal';
import { DraftSubmission } from '../../models/submission-system-models';
import { ArticleType } from '../../models/submission-system-models/article-type';

export interface CreateDraftManuscriptInput {
  journalId: string;
  sectionId: string;
  specialIssueId: string;
  customId: string;
}

export interface AuthorInput {
  email: string;
  givenNames: string;
  surname: string;
  affRorId: string;
  country: string;
  isSubmitting: boolean;
  isCorresponding: boolean;
  aff: string;
}

export interface SubmissionUploadFile {
  size: number;
  type: string;
}

export interface UpdateDraftManuscriptInput {
  meta: {
    title: string;
    abstract: string;
    agreeTc: boolean;
    conflictOfInterest: string;
    dataAvailability: string;
    fundingStatement: string;
    articleTypeId: string;
  };
  authors: [];
  files: [];
  journalId: string;
  sectionId: string;
  preprintValue: string;
  sourceJournalId: string;
  sourceJournalManuscriptId: string;
  linkedSubmissionCustomId: string;
}

export interface ReviewClientContract {
  getRemoteUrl(): string;

  createNewDraftSubmission(
    input: CreateDraftManuscriptInput
  ): Promise<DraftSubmission>;
  setSubmissionManuscriptDetails(
    submissionId: UniqueEntityID,
    manuscript: Manuscript
  ): Promise<void>;

  setSubmissionAuthors(
    manuscriptId: string,
    authorInput: AuthorInput
  ): Promise<string>;

  uploadFiles(submissionId: UniqueEntityID, files: Array<File>): Promise<void>;

  getAllActiveJournals(): Promise<Array<ActiveJournal>>;

  getSourceJournals(): Promise<SourceJournal[]>;

  uploadFile(
    entityId: string,
    fileInput: SubmissionUploadFile,
    fileName: string
  ): Promise<string>;

  updateDraftManuscript(
    manuscriptId: string,
    draftManuscriptInput: UpdateDraftManuscriptInput
  ): Promise<string>;

  getArticleTypes(): Promise<ArticleType[]>;
}
