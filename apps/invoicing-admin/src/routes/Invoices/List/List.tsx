import React, { useEffect, useCallback } from 'react';
import { useManualQuery } from 'graphql-hooks';
import { useQueryState } from 'react-router-use-location-state';
import { Filters } from '@utils';
import { useLocalStorage } from '@rehooks/local-storage';

import {
  Card,
  CardFooter,
  Error,
  ListPagination,
  Table,
} from '../../../components';

// import { TrTableInvoicesList } from './components/TrTableList';
import { InvoicesTableBody } from './components/TableBody';
import { Loading } from '../../components';

import { INVOICES_QUERY } from './graphql';

const RecentInvoicesList: React.FC<RecentInvoicesListProps> = (props) => {
  const { pagination: defaultPaginator } = props.state;

  const [{ pagination }] = useLocalStorage('invoicesList', {
    pagination: defaultPaginator,
  });

  const [fetchInvoices, { loading, error, data }] = useManualQuery(
    INVOICES_QUERY
  );

  const [page, setPageInUrl] = useQueryState('page', defaultPaginator.page);

  const fetchData = useCallback(
    async (currentPage) => {
      const { filters } = props.state;
      await fetchInvoices({
        variables: {
          filters: Filters.collect(filters),
          pagination: {
            ...defaultPaginator,
            page: currentPage,
            offset: currentPage - 1,
          },
        },
      });
    },
    [fetchInvoices, props.state]
  );

  const onPageChange = ({ currentPage }: any) => {
    props.setPage('page', currentPage);
    fetchData(currentPage);
    setPageInUrl(currentPage);
  };

  useEffect(() => {
    fetchData(page);
  }, [fetchData, page, fetchInvoices]);

  if (loading) return <Loading />;

  if (error) return <Error data={error as any} />;

  return (
    <Card className='mb-0'>
      <InvoicesTableBody data={data?.invoices} />
      <CardFooter className='d-flex justify-content-center pb-0'>
        <ListPagination
          totalRecords={data?.invoices?.totalCount}
          pageNeighbours={1}
          onPageChanged={onPageChange}
          pageLimit={defaultPaginator.limit}
          currentPage={page}
        />
      </CardFooter>
    </Card>
  );
};

interface RecentInvoicesListProps {
  state: {
    pagination: {
      page: number;
      offset: number;
      limit: number;
    };
    filters: {
      invoiceStatus: string[];
      transactionStatus: string[];
      journalId: string[];
      referenceNumber: string;
      customId: string;
    };
  };
  setPage(key: string, value: string | boolean | any[]): void;
}

export default RecentInvoicesList;
