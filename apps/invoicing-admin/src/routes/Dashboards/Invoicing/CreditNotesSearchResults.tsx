import React from 'react';
import { Link } from 'react-router-dom';
import format from 'date-fns/format';

import {
  Card,
  Table,
} from '../../../components';

const CreditNotesSearchResults: React.FC<SearchListProps> = (props) => {
  console.info(props);
  return (
    <Card className='mb-0'>
      <span className='bt-6 mt-1 ml-2' style={{ display: 'inline-block'}}><strong>{props.title.toUpperCase()}</strong></span>
      {/* START Table */}
      <div className='table-responsive-xl'>
        <Table className='mb-0 table-striped' hover>
          <thead>
            <tr>
              <th className='align-middle bt-0'>Reference Number</th>
              <th className='align-middle bt-0'>Referenced Invoice</th>
              <th className='align-middle bt-0'>Reason</th>
              <th className='align-middle bt-0'>Creation Date</th>
              <th className='align-middle bt-0'>Issue Date</th>
              <th className='align-middle bt-0'>Updated Date</th>
            </tr>
          </thead>
          <tbody>
          {props.searchResults['creditNotes'].map(
            ({
              id,
              invoiceId,
              persistentReferenceNumber,
              creationReason,
              dateCreated,
              dateIssued,
              dateUpdated,
            }) => (
              <tr
                key={id}
                className={'table-warning'}
              >
                <td className='align-middle'>
                  <Link
                    to={`/credit-notes/details/${id}`}
                    className='text-decoration-none'
                  >
                    <span
                      className={'badge badge-warning'}
                    >
                      <strong>
                        {`CN-${persistentReferenceNumber}`}
                      </strong>
                    </span>
                  </Link>
                </td>
                <td className='align-middle'>
                  <Link
                    to={`/invoice/details/${invoiceId}`}
                    className='text-decoration-none'
                  >
                    {`${invoiceId}`}
                  </Link>
                </td>
                <td className='align-middle'>
                  <span className='text-secondary'>
                    {creationReason}
                  </span>
                </td>
                <td className='align-middle text-nowrap'>
                  {dateIssued && format(new Date(dateCreated), 'dd MMM yyyy')}
                </td>
                <td className='align-middle text-nowrap'>
                  {dateIssued && format(new Date(dateIssued), 'dd MMM yyyy')}
                </td>
                <td className='align-middle text-nowrap'>
                  {dateUpdated && format(new Date(dateUpdated), 'dd MMM yyyy')}
                </td>
              </tr>
            )
          )}
          </tbody>
        </Table>
      </div>
      {/* END Table */}
      {/* <CardFooter className='d-flex justify-content-center pb-0'>
        <ListPagination
          totalRecords={data[props.title].totalCount}
          pageNeighbours={1}
          onPageChanged={onPageChanged}
          pageLimit={pagination.limit}
          currentPage={pagination.page}
        />
      </CardFooter> */}
    </Card>
  );
};

interface SearchListProps {
  title: string,
  searchResults: any[]
}

export default CreditNotesSearchResults;
