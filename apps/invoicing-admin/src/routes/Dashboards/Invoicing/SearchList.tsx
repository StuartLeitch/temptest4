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

import { TrTableInvoicesList } from '../../Invoices/List/components/TrTableList';
import { Loading } from '../../components';

import { INVOICES_AND_CREDIT_NOTES_QUERY } from '../../Invoices/List/graphql';

const RecentInvoicesList: React.FC<RecentInvoicesListProps> = (props) => {
  const { pagination: defaultPaginator, filters } = props.state;

  const [{ pagination }] = useLocalStorage(
    'searchList',
    { pagination:  defaultPaginator, filters }
  );

  // const [fetchResults, { loading, error, data }] = useManualQuery(
  //   INVOICES_AND_CREDIT_NOTES_QUERY
  // );

  const onPageChanged = ({ currentPage }: any) => {
    props.setPage('page', currentPage);
  };

  // useEffect(() => {
  //   async function fetchData() {
  //     const { filters, pagination } = props.state;
  //     await fetchResults({
  //       variables: {
  //         filters: Filters.collect(filters),
  //         pagination,
  //       },
  //     });
  //   }
  //   fetchData();
  // }, [fetchResults, props.state]);

  const data = props.searchResults;

  if (!data) return null;

  if ((data as any).totalCount === 0) return null;

  if (props.loading) return <Loading />;

  // if (error) return <Error data={error as any} />;

  return ([
    <span className='bt-6 mt-4 ml-2' style={{ display: 'inline-block'}}><strong>{props.title.toUpperCase()}</strong></span>,
    <Card className='mb-0'>
      {/* START Table */}
      <div className='table-responsive-xl'>
        <Table className='mb-0 table-striped' hover>
          <thead>
            <tr>
              <th className='align-middle bt-0'>Status</th>
              <th className='align-middle bt-0'>Reference</th>
              <th className='align-middle bt-0'>Manuscript Custom ID</th>
              <th className='align-middle bt-0'>Issue Date</th>
              <th className='align-middle bt-0'>APC</th>
              <th className='align-middle bt-0'>Journal Title</th>
              <th className='align-middle bt-0'>Manuscript Title</th>
              <th className='align-middle bt-0'>Manuscript Acceptance Date</th>
            </tr>
          </thead>
          <tbody>
            <TrTableInvoicesList invoices={data[props.title] || []} />
          </tbody>
        </Table>
      </div>
      {/* END Table */}
      <CardFooter className='d-flex justify-content-center pb-0'>
        <ListPagination
          totalRecords={data[props.title].totalCount}
          pageNeighbours={1}
          onPageChanged={onPageChanged}
          pageLimit={pagination.limit}
          currentPage={pagination.page}
        />
      </CardFooter>
    </Card>
  ]);
};

interface RecentInvoicesListProps {
  loading: boolean,
  title: string,
  searchResults: any[],
  state: {
    pagination: {
      page: number;
      offset: number;
      limit: number;
    },
    filters: {
      referenceNumber: string;
      customId: string;
    }
};
  setPage(key: string, value: string | boolean | any[]): void;
}

export default RecentInvoicesList;
