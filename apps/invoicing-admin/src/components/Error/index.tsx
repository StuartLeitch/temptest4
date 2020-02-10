import React from 'react';
import { Alert, Media } from 'reactstrap';

export default function(props) {
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
    message = graphQLErrors.map(error => {debugger});
  }

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
