import React from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import { useQuery } from 'graphql-hooks';

const JOURNALS_QUERY = `
query fetchJournals {
  journals {
    ...journalFragment
  }
}

fragment journalFragment on Journal {
  journalId
  journalTitle
}
`;

export const JournalsSelections = props => {
  const { loading, error, data } = useQuery(
    JOURNALS_QUERY
  );

  return <Typeahead
    {...props}
    clearButton
    multiple
    id='journalsSelections'
    // defaultSelected={journals.slice(0, 5)}
    labelKey='journalTitle'
    options={data?.journals ?? []}
    placeholder='Enter a journal title&hellip;'
  />
};
