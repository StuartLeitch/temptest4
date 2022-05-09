import { UniqueEntityID, ValueObjectProps } from '@hindawi/shared';

import { Manuscript, File, Journal } from '../../models';
import { ActiveJournal } from '../../models/submission-system-models/active-journal';
import { SubmissionFile } from '../../models/submission-system-models/file-submission';
import { SourceJournal } from '../../models/submission-system-models/source-journal';
import {ReadStream} from "fs";

export type CreateDraftManuscriptInput = {
  journalId: string;
  sectionId: string;
  specialIssueId: string;
  customId: string;
};

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
  id: string;
  name: string;
  size: number;
  type: string;
}


export interface SubmissionServiceContract {
  createNewDraftSubmission(input: CreateDraftManuscriptInput): Promise<string>;
  setSubmissionManuscriptDetails(
    submissionId: UniqueEntityID,
    manuscript: Manuscript
  ): Promise<void>;

  setSubmissionAuthors(
    manuscriptId: string,
    authors: Array<AuthorInput>
  ): Promise<string>;

  uploadFiles(submissionId: UniqueEntityID, files: Array<File>): Promise<void>;

  getAllActiveJournals(): Promise<Array<ActiveJournal>>;

  getSourceJournals(): Promise<SourceJournal[]>;

  uploadFile(
    entityId: string,
    fileInput: SubmissionUploadFile,
    file: ReadStream
  ): Promise<string>;
}
