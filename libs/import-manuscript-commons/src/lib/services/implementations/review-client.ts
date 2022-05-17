/* eslint-disable max-len */
import { KeycloakAuthenticator } from './keycloakAuthenticator';
import axios, { AxiosRequestHeaders } from 'axios';
import VError, { MultiError } from 'verror';
import { ASTNode, print } from 'graphql';
import FormData from 'form-data';
import gql from 'graphql-tag';
import * as fs from 'fs';

import { ActiveJournal } from '../../models/submission-system-models/active-journal';
import { SourceJournal } from '../../models/submission-system-models/source-journal';
import { SourceJournalMapper } from '../../models/mappers/source-journal-mapper';
import {
  RawDraftSubmissionProps,
  SubmissionSystemDraftSubmissionMapper,
} from '../../models/mappers/submission-system-draft-submission-mapper';
import { SubmissionSystemActiveJournalMapper } from '../../models/mappers/submission-system-active-journal-mapper';
import { RawTeamMemberProps } from '../../models/mappers/submission-system-team-member-mapper';
import { RawSubmissionFileProps } from '../../models/mappers/submission-system-file-mapper';
import { DraftSubmission } from '../../models/submission-system-models/draft-submission';
import { File, Manuscript } from '../../models';

import {
  AuthorInput,
  CreateDraftManuscriptInput,
  ReviewClientContract,
  SubmissionUploadFile,
  UpdateDraftManuscriptInput,
} from '../contracts';
import { LoggerBuilder, UniqueEntityID } from '@hindawi/shared';
import { ArticleType } from '../../models/submission-system-models/article-type';
import { SubmissionSystemArticleTypeMapper } from '../../models/mappers/submission-system-article-types-mapper';

type GqlVariables = Record<string, unknown>;
type GqlResponse<T = unknown> = {
  data: T;
};

class GqlError extends Error {
  constructor(
    public message: string,
    public serviceName: string,
    public code: string
  ) {
    super(message);
  }
}

export class ReviewClient implements ReviewClientContract {
  constructor(
    private readonly submissionEndpoint: string,
    private readonly keycloakAuthenticator: KeycloakAuthenticator,
    private readonly loggerBuilder: LoggerBuilder
  ) {
    this.loggerBuilder.getLogger(ReviewClient.name);
  }

  getRemoteUrl(): string {
    return this.submissionEndpoint;
  }

  async getArticleTypes(): Promise<ArticleType[]> {
    const getArticleTypesQuery = gql`
      query getArticleTypes {
        getArticleTypes {
          id
          name
        }
      }
    `;

    const response = await this.callGraphql<{
      getArticleTypes: Array<ArticleType>;
    }>(getArticleTypesQuery);

    return response.getArticleTypes.map(
      SubmissionSystemArticleTypeMapper.toDomain
    );
  }

  async getAllActiveJournals(): Promise<ActiveJournal[]> {
    const activeJournalsQuery = gql`
      query getActiveJournals {
        getActiveJournals {
          id
          name
          code
          apc
          preprintDescription
          articleTypes {
            id
            name
            __typename
          }
          __typename
        }
      }
    `;
    const response = await this.callGraphql<{ getActiveJournals: Array<any> }>(
      activeJournalsQuery
    );
    return response.getActiveJournals.map(
      SubmissionSystemActiveJournalMapper.toDomain
    );
  }

  async getSourceJournals(): Promise<SourceJournal[]> {
    const aa = gql`
      query getSourceJournals {
        getSourceJournals {
          id
          name
          #          eissn must change review api to return eissn
          #          pissn must change review api to return pissn
          __typename
        }
      }
    `;

    const response = await this.callGraphql<{ getSourceJournals: Array<any> }>(
      aa
    );

    return response.getSourceJournals.map(SourceJournalMapper.toDomain);
  }

  async createNewDraftSubmission(
    input: CreateDraftManuscriptInput
  ): Promise<DraftSubmission> {
    const createNewDraftManuscriptMutation = gql`
      mutation createDraftManuscript($input: CreateDraftManuscriptInput!) {
        createDraftManuscript(input: $input) {
          id
          submissionId
        }
      }
    `;

    const response = await this.callGraphql<{
      createDraftManuscript: RawDraftSubmissionProps;
    }>(createNewDraftManuscriptMutation, { input });

    return SubmissionSystemDraftSubmissionMapper.toDomain(
      response.createDraftManuscript
    );
  }

  async updateDraftManuscript(
    manuscriptId: string,
    autosaveInput: UpdateDraftManuscriptInput
  ): Promise<string> {
    const updateDraftManuscriptMutation = gql`
      mutation updateDraftManuscript(
        $manuscriptId: String!
        $autosaveInput: DraftAutosaveInput
      ) {
        updateDraftManuscript(
          manuscriptId: $manuscriptId
          autosaveInput: $autosaveInput
        ) {
          id
        }
      }
    `;

    const response = await this.callGraphql<{
      updateDraftManuscript: string;
    }>(updateDraftManuscriptMutation, { manuscriptId, autosaveInput });

    return response.updateDraftManuscript['id'] || '';
  }

  async setSubmissionAuthors(
    manuscriptId: string,
    authorInput: AuthorInput
  ): Promise<string> {
    const addAuthorToManuscriptMutation = gql`
      mutation addAuthorToManuscript(
        $manuscriptId: String!
        $authorInput: AuthorInput!
      ) {
        addAuthorToManuscript(
          manuscriptId: $manuscriptId
          authorInput: $authorInput
        ) {
          id
        }
      }
    `;

    const response = await this.callGraphql<{
      addAuthorToManuscript: RawTeamMemberProps;
    }>(addAuthorToManuscriptMutation, { manuscriptId, authorInput });

    return response.addAuthorToManuscript['id'] || '';
  }

  async uploadFile(
    entityId: string,
    fileInput: SubmissionUploadFile,
    fileName: string
  ): Promise<string> {
    const uploadFileMutation = gql`
      mutation uploadFile(
        $entityId: String!
        $fileInput: FileInput
        $file: Upload!
      ) {
        uploadFile(entityId: $entityId, fileInput: $fileInput, file: $file) {
          id
          type
          size
          originalName
          filename
          mimeType
          __typename
        }
      }
    `;

    const response = await this.uploadFileGraphql<{
      uploadFile: RawSubmissionFileProps;
    }>(uploadFileMutation, fileName, { fileInput, entityId, file: null });

    return response.uploadFile['id'] || '';
  }

  async setSubmissionManuscriptDetails(
    submissionId: UniqueEntityID,
    manuscript: Manuscript
  ): Promise<void> {
    return null;
  }

  async uploadFiles(
    submissionId: UniqueEntityID,
    files: File[]
  ): Promise<void> {
    throw new VError('Not implemented');
  }

  private async callGraphql<T = unknown>(
    request: ASTNode,
    variable?: GqlVariables
  ): Promise<T> {
    const authorizationToken =
      await this.keycloakAuthenticator.getAuthorizationToken();
    const headers: AxiosRequestHeaders = {
      Authorization: `Bearer ${authorizationToken}`,
      'content-type': 'application/json',
    };

    const graphqlQuery = {
      query: print(request),
      variables: variable,
    };

    try {
      const resp = await axios.post<GqlResponse<T>>(
        this.submissionEndpoint,
        graphqlQuery,
        {
          headers,
        }
      );

      if (resp.data['errors']) {
        throw parseGqlErrors(resp.data['errors']);
      }
      return resp.data.data;
    } catch (err) {
      if (err.response?.data?.errors) {
        throw new VError(
          err,
          JSON.stringify(err.response.data.errors, null, 2)
        );
      }
      throw new VError(err);
    }
  }

  private async uploadFileGraphql<T = unknown>(
    request: ASTNode,
    fileName: string,
    variable?: GqlVariables
  ): Promise<T> {
    const authorizationToken =
      await this.keycloakAuthenticator.getAuthorizationToken();

    const graphqlQuery = {
      variables: variable,
      query: print(request),
    };
    const formData: FormData = new FormData();

    const file = await fs.promises.readFile(fileName);

    const headers: AxiosRequestHeaders = {
      Authorization: `Bearer ${authorizationToken}`,
      'content-type': `multipart/form-data; boundary=${formData.getBoundary()}`,
    };

    formData.append('operations', JSON.stringify(graphqlQuery));
    formData.append('map', JSON.stringify({ '0': ['variables.file'] }));
    formData.append('0', file, { filepath: fileName, filename: fileName });
    try {
      const resp = await axios.post<GqlResponse<T>>(
        this.submissionEndpoint,
        formData,
        {
          headers,
        }
      );

      if (resp.data['errors']) {
        throw parseGqlErrors(resp.data['errors']);
      }
      return resp.data.data;
    } catch (err) {
      throw new VError(err);
    }
  }
}

function parseGqlErrors(errs: any[]): MultiError {
  const gqlErrors: Array<GqlError> = new Array<GqlError>();
  for (const err of errs) {
    gqlErrors.push(
      new GqlError(
        err['message'],
        err['extensions']['serviceName'],
        err['extensions']['code']
      )
    );
  }
  return new MultiError(gqlErrors);
}
