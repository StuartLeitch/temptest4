import React from 'react';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import numeral from 'numeral';

import { formatDate } from '../../../../utils/date';
import { Badge } from '../../../../components';
import {CREATION_REASON} from "../componentUtils";

const TrTableCreditNotesList = ({ creditNotes }) => {
  return (
    <React.Fragment>
      {creditNotes.creditNotes.map(
        ({
          id,
          creationReason,
          invoice,
          totalPrice,
          dateIssued,
          persistentReferenceNumber,
        }) => (
          <tr key={id}>
            <td className='align-middle'>
              <Badge>{CREATION_REASON[creationReason]}</Badge>
            </td>
            <td className='align-left'>
              <Link
                to={`/credit-notes/details/${id}`}
                className='text-decoration-none'
              >
                {invoice?.invoiceItem?.article?.customId}
              </Link>
            </td>
            <td className='align-middle'>
              <Link
                to={`/credit-notes/details/${id}`}
                className='text-decoration-none'
              >
                <span className={'text-warning'}>
                  <strong>{persistentReferenceNumber}</strong>
                </span>
              </Link>
            </td>

            <td className='align-middle'>
              {dateIssued && formatDate(new Date(dateIssued))}
            </td>

            <td className='align-middle'>
              <strong className='text-danger'>
                {numeral(totalPrice).format('$0.00')}
              </strong>
            </td>
          </tr>
        )
      )}
    </React.Fragment>
  );
};

export { TrTableCreditNotesList };
