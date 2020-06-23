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

export const JournalsSelections: React.FC<JournalSelectionsProps> = props => {
  const { data } = useQuery(JOURNALS_QUERY);

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

interface Journal {
  journalId: string;
};
interface JournalSelectionsProps {
  selected: Journal[];
  onChange(selections: Journal[]): void;
};
