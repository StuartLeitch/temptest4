import axios, { AxiosError, AxiosRequestHeaders } from 'axios';
import { LoggerBuilder, LoggerContract, UniqueEntityID } from '@hindawi/shared';
import { ASTNode, print } from 'graphql';
import VError, { MultiError } from 'verror';
import gql from 'graphql-tag';

import { File, Manuscript } from '../../models';

import {
  AuthorInput,
  CreateDraftManuscriptInput,
  SubmissionServiceContract,
} from '../contracts';
import { KeycloakAuthenticator } from './keycloakAuthenticator';
import { env } from '@hindawi/import-manuscript-validation/env';
import { ActiveJournal } from '../../models/submission-system-models/active-journal';
import { SubmissionSystemActiveJournalMapper } from '../../models/mappers/submission-system-active-journal-mapper';
import { SourceJournal } from '../../models/submission-system-models/source-journal';
import { SourceJournalMapper } from '../../models/mappers/source-journal-mapper';
import {
  RawDraftSubmissionProps,
  SubmissionSystemDraftSubmissionMapper,
} from '../../models/mappers/submission-system-draft-submission-mapper';
import {
  RawTeamMemberProps,
  SubmissionSystemTeamMemberMapper,
} from '../../models/mappers/submission-system-team-member-mapper';
import { SubmissionFile } from '../../models/submission-system-models/file-submission';
import {
  RawSubmissionFileProps,
  SubmissionSystemFileMapper,
} from '../../models/mappers/submission-system-file-mapper';

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

export class SubmissionService implements SubmissionServiceContract {
  private logger: LoggerContract = new LoggerBuilder(
    'Import/Manuscript/Backend/SubmissionService',
    {
      isDevelopment: env.isDevelopment,
      logLevel: env.log.level,
    }
  ).getLogger();

  constructor(
    private readonly submissionEndpoint: string,
    private readonly keycloakAuthenticator: KeycloakAuthenticator
  ) {}

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
  ): Promise<string> {
    const createNewDraftManuscriptMutation = gql`
      mutation createDraftManuscript($input: CreateDraftManuscriptInput!) {
        createDraftManuscript(input: $input) {
          id
        }
      }
    `;

    const response = await this.callGraphql<{
      createDraftManuscript: RawDraftSubmissionProps;
    }>(createNewDraftManuscriptMutation, { input });

    return SubmissionSystemDraftSubmissionMapper.toDomain(
      response.createDraftManuscript
    ).id;
  }

  async setSubmissionAuthors(
    manuscriptId: string,
    authors: AuthorInput[]
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

    for (const authorInput of authors) {
      const response = await this.callGraphql<{
        addAuthorToManuscript: RawTeamMemberProps[];
      }>(addAuthorToManuscriptMutation, { manuscriptId, authorInput });
      return SubmissionSystemTeamMemberMapper.toDomain(
        response.addAuthorToManuscript
      ).id;
    }

    return;
  }

  async uploadFile(
    entityId: string,
    fileInput: SubmissionFile,
    file: any
  ): Promise<string> {
    const uploadFileMutation = gql`
      mutation uploadFile(
        $entityId: String!
        $fileInput: SubmissionFile
        $file: any
      ) {
        uploadFile(entityId: $entityId, fileInput: $fileInput, file: $file) {
          id
        }
      }
    `;

    const response = await this.callGraphql<{
      uploadFile: RawSubmissionFileProps;
    }>(uploadFileMutation, { entityId, fileInput, file });

    return SubmissionSystemFileMapper.toDomain(response.uploadFile).id;
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
    return null;
  }

  private async callGraphql<T = unknown>(
    request: ASTNode,
    variable?: GqlVariables
  ): Promise<T> {
    const authorizationToken =
      await this.keycloakAuthenticator.getAuthorizationToken();
    const headers: AxiosRequestHeaders = {
      Authorization: `Bearer ${authorizationToken}`,
      'content-type': 'form-data',
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
        throw this.parseGqlErrors(resp.data['errors']);
      }
      return resp.data.data;
    } catch (err) {
      throw new VError(err);
    }
  }

  private parseGqlErrors(errs: any[]): MultiError {
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
}
