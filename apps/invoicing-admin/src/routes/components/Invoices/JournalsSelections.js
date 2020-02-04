import React from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';

import journals from './journals';

export const JournalsSelections = props => (
  <Typeahead
    {...props}
    clearButton
    multiple
    id='journalsSelections'
    // defaultSelected={journals.slice(0, 5)}
    labelKey='journalTitle'
    options={journals}
    placeholder='Enter a journal title&hellip;'
  />
);
