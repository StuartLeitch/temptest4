import React from 'react';
import { Alert, Media } from 'reactstrap';

const Error: React.FC<ErrorProps> = props => {
  const { data: { fetchError, httpError, graphQLErrors }, ...alert} = props;
  let title, message;

  if (fetchError != null) {
    title = `A fetch error occurred (${fetchError.name})`;
    message = fetchError.message;
  } else if (httpError != null) {
    title = `A HTTP error occurred (${httpError.statusText})`;
    message = httpError.body;
  } else if (graphQLErrors != null) {
    const len = graphQLErrors.length;
    title = `${len} GraphQL ${len > 0 ? 'errors have' : 'error'} occurred`;
    // eslint-disable-next-line no-debugger
    message = graphQLErrors.map(error => {
      return (
        <div>{(error && (error as any).message) || ''}</div>
      )
    });

    return (
      <Alert color="danger" {...alert}>
        <Media>
          <Media left middle className="mr-2">
            <i className="fa fa-close fa-fw fa-2x alert-icon"/>
          </Media>
          <Media body>
            <h6 className="mb-1 alert-heading">{title}</h6>
            {message}
          </Media>
        </Media>
      </Alert>
    );
  }
}

interface ErrorProps {
  data?: {
    fetchError: null | {
      message: string;
      name: string;
    };
    httpError: null | {
      body: string;
      statusText: string;
    };
    graphQLErrors: string[];
  };
  [key: string]: any;
};

export { Error };
