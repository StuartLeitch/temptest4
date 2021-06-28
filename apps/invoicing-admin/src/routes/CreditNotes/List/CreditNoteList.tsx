import React, { useEffect } from 'react';
import { useManualQuery } from 'graphql-hooks';
import { Filters } from '@utils';
import { useLocalStorage } from '@rehooks/local-storage';

import {
  Card,
  CardFooter,
  Error,
  ListPagination,
  Table,
} from '../../../components';

import { TrTableCreditNotesList } from './components/TrTableList';
import { Loading } from '../../components';

import { CREDIT_NOTES_QUERY } from './graphql';

const RecentInvoicesList: React.FC<RecentCreditNotesListProps> = (props) => {
  const { pagination: defaultPaginator, filters } = props.state;

  const [{ pagination }] = useLocalStorage(
    'creditNotesList',
    { pagination:  defaultPaginator, filters }
  );

  const [fetchCreditNotes, { loading, error, data }] = useManualQuery(
    CREDIT_NOTES_QUERY
  );

  const onPageChanged = ({ currentPage }: any) => {
    props.setPage('page', currentPage);
  };

  useEffect(() => {
    async function fetchData() {
      const { filters, pagination } = props.state;
      await fetchCreditNotes({
        variables: {
          filters: Filters.collect(filters),
          pagination,
        },
      });
    }
    fetchData();
  }, [fetchCreditNotes, props.state]);

  if (loading) return <Loading />;
  if (error) return <Error data={error as any} />;
  
  if(data) {
    return (
      <Card className='mb-0'>
        {/* START Table */}
        <div className='table-responsive-xl'>
          <Table className='mb-0 table-striped' hover>
            <thead>
              <tr>
                <th className='align-middle bt-0'>Reason</th>
                <th className='align-middle bt-0'>Reference</th>
                <th className='align-middle bt-0'>Price</th>
                <th className='align-middle bt-0'>Vat</th>
                <th className='align-middle bt-0'>Date Issued</th>
                <th className='align-middle bt-0'>Date Created</th>
              </tr>
            </thead>
            <tbody>
              <TrTableCreditNotesList creditNotes={data?.getRecentCreditNotes} />
            </tbody>
          </Table>
        </div>
        {/* END Table */}
        <CardFooter className='d-flex justify-content-center pb-0'>
          <ListPagination
            totalRecords={data?.creditNotes?.totalCount}
            pageNeighbours={1}
            onPageChanged={onPageChanged}
            pageLimit={pagination.limit}
            // to be changed from 1 to value
            currentPage={1}
          />
        </CardFooter>
      </Card>
    );
  }

    return <Loading />
};

interface RecentCreditNotesListProps {
  state: {
    pagination: {
      page: number;
      offset: number;
      limit: number;
    },
    filters: {
      invoiceStatus: string[];
      transactionStatus: string[];
      journalId: string[];
      referenceNumber: string;
      customId: string;
    }
};
  setPage(key: string, value: string | boolean | any[]): void;
}

export default RecentInvoicesList;
