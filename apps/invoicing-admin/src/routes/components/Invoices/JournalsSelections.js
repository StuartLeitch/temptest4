import React from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';

import journals from './journals';

export const JournalsSelections = () => (
  <Typeahead
    clearButton
    // defaultSelected={journals.slice(0, 5)}
    labelKey='journalTitle'
    multiple
    options={journals}
    placeholder='Choose a journal title&hellip;'
  />
);
