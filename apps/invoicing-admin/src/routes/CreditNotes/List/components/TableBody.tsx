import React from 'react';

import {
  Table
} from '../../../../components';
import { TrTableCreditNotesList } from './TrTableList';

const CreditNotesTableBody = (props) => {

  if (!props.data) return null;

  return (
    <div className='table-responsive-xl'>
      {/* START Table */}
      <Table className='mb-0 table-striped' hover>
          <thead>
            <tr>
              <th className='align-middle bt-0'>Manuscript Custom ID</th>
              <th className='align-middle bt-0'>Reference number</th>
              <th className='align-middle bt-0'>Reason</th>
              <th className='align-middle bt-0'>Net Amount</th>
            </tr>
          </thead>
        <tbody>
          <TrTableCreditNotesList creditNotes={props.data} />
        </tbody>
      </Table>
      {/* END Table */}
    </div>
  )};

  export { CreditNotesTableBody};
