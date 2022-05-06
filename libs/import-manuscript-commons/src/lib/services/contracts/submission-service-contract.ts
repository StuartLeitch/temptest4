import { UniqueEntityID } from '@hindawi/shared';

import { Manuscript, Author, File, Journal } from '../../models';
import { ActiveJournal } from '../../models/submission-system-models/active-journal';
import { SourceJournal } from '../../models/submission-system-models/source-journal';

export interface SubmissionServiceContract {
  createNewDraftSubmission(
    journalId: string,
    sectionId: string,
    specialIssuedId: string,
    customId: string
  ): Promise<string>;
  setSubmissionManuscriptDetails(
    submissionId: UniqueEntityID,
    manuscript: Manuscript
  ): Promise<void>;
  setSubmissionAuthors(
    submissionId: UniqueEntityID,
    authors: Array<Author>
  ): Promise<void>;
  uploadFiles(submissionId: UniqueEntityID, files: Array<File>): Promise<void>;
  getAllActiveJournals(): Promise<Array<ActiveJournal>>;
  getSourceJournals(): Promise<SourceJournal[]>;
}
