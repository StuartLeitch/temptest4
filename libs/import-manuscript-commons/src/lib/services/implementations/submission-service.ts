import axios, { AxiosRequestHeaders, AxiosError } from 'axios';
import { UniqueEntityID } from '@hindawi/shared';
import { ASTNode, print } from 'graphql';
import { MultiError } from 'verror';
import gql from 'graphql-tag';

import { Manuscript, Author, File, Journal } from '../../models';
import { JournalMapper } from '../../models/mappers';

import { SubmissionServiceContract } from '../contracts';

type GqlVariables = Record<string, unknown>;
type GqlResponse<T = unknown> = {
  data: T;
};

type GqlErrorLocation = { line: number; column: number };
type GqlError = {
  message: string;
  locations: Array<GqlErrorLocation>;
  extensions: {
    code: string;
    exception: {
      stacktrace: Array<string>;
    };
  };
};

type GqlErrorResponse = {
  errors: Array<GqlError>;
};

export class SubmissionService implements SubmissionServiceContract {
  constructor(
    private readonly submissionEndpoint: string,
    private readonly authToken: string
  ) {}

  async getAllActiveJournals(): Promise<Journal[]> {
    const aa = gql`
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
      aa
    );

    return response.getActiveJournals.map(JournalMapper.toDomain);
  }

  async createNewDraftSubmission(): Promise<UniqueEntityID> {
    return null;
  }

  async setSubmissionAuthors(
    submissionId: UniqueEntityID,
    authors: Author[]
  ): Promise<void> {
    return null;
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
    const headers: AxiosRequestHeaders = {
      Authorization: `Bearer ${this.authToken}`,
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

      return resp.data.data;
    } catch (err) {
      throw parseGqlErrors(err);
    }
  }
}

function parseLocation(loc: GqlErrorLocation): string {
  return `line: ${loc.line} column: ${loc.column}`;
}

function processError(err: GqlError): Error {
  const errLocation = err.locations.map(parseLocation).join(' ');
  const error = new Error(`${err.message} ${errLocation}`);

  error.stack = err.extensions.exception.stacktrace.join('\n');

  return error;
}

function parseGqlErrors(err: AxiosError<GqlErrorResponse>): Error {
  return new MultiError(err.response.data.errors.map(processError));
}
