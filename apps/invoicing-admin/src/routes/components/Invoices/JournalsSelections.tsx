/* eslint-disable @typescript-eslint/no-explicit-any */
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

export const JournalsSelections = (props) => {
  const { /*loading, error,*/ data } = useQuery(JOURNALS_QUERY);
  // console.info(props.defaultSelected);
  // const defaultSelected = data?.journals.filter((j: any) => {
  //   console.info(j.journalId);
  //   return props.defaultSelected.includes(j.journalId);
  // });
  // console.info(defaultSelected);
  return (
    <Typeahead
      {...props}
      clearButton
      multiple
      id='journalsSelections'
      selected={data?.journals.filter((j: any) =>
        props.selected.includes(j.journalId)
      )}
      labelKey='journalTitle'
      options={data?.journals ?? []}
      placeholder='Enter a journal title&hellip;'
    />
  );
};
