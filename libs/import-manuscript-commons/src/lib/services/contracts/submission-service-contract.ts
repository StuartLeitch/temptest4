import { UniqueEntityID } from '@hindawi/shared';

import { Manuscript, Author, File, Journal } from '../../models';

export interface SubmissionServiceContract {
  createNewDraftSubmission(): Promise<UniqueEntityID>;
  setSubmissionManuscriptDetails(
    submissionId: UniqueEntityID,
    manuscript: Manuscript
  ): Promise<void>;
  setSubmissionAuthors(
    submissionId: UniqueEntityID,
    authors: Array<Author>
  ): Promise<void>;
  uploadFiles(submissionId: UniqueEntityID, files: Array<File>): Promise<void>;
  getAllActiveJournals(): Promise<Array<Journal>>;
}
