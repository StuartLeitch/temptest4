import React, { useEffect, useState } from 'react';
import { useManualQuery } from 'graphql-hooks';
import LoadingOverlay from 'react-loading-overlay';

import {
  Card,
  CardFooter,
  ListPagination,
  Spinner,
  Table
} from '../../../components';

import { TrTableInvoicesList } from './components/TrTableList';

const INVOICES_QUERY = `query fetchInvoices($offset: Int, $limit: Int) {
  invoices(offset: $offset, limit: $limit) {
    totalCount
    invoices {
      id: invoiceId
      status
      manuscriptTitle: title
      type
      price
      customId
      dateCreated
    }
  }
}
`;

const RecentInvoicesList = () => {
  const [pagination, setPagination] = useState({});

  const [fetchInvoices, { loading, error, data }] = useManualQuery(
    INVOICES_QUERY
  );
  const onPageChanged = (data: any) => {
    setPagination(data);
    fetchInvoices({
      variables: { offset: data?.currentPage - 1, limit: data?.pageLimit }
    });
  };

  useEffect(() => {
    async function fetchData() {
      await fetchInvoices({
        variables: { offset: 0, limit: 10 }
      });
    }
    fetchData();
  }, []);

  if (loading)
    return (
      <LoadingOverlay
        active={loading}
        spinner={
          <Spinner
            style={{ width: '12em', height: '12em' }}
            color='secondary'
          />
        }
      />
    );

  if (error) return <div>Something Bad Happened</div>;

  return (
    <Card className='mb-0'>
      {/* START Table */}
      <div className='table-responsive-xl'>
        <Table className='mb-0 table-striped' hover>
          <thead>
            <tr>
              <th className='align-middle bt-0'>Status</th>
              <th className='align-middle bt-0'>Manuscript Title</th>
              <th className='align-middle bt-0'>Type</th>
              <th className='align-middle bt-0'>Amount</th>
              <th className='align-middle bt-0'>Created On</th>
              <th className='align-middle bt-0'>Corresponding Author</th>
              <th className='align-middle bt-0 text-right'>Actions</th>
            </tr>
          </thead>
          <tbody>
            <TrTableInvoicesList invoices={data?.invoices?.invoices || []} />
          </tbody>
        </Table>
      </div>
      {/* END Table */}
      <CardFooter className='d-flex justify-content-center pb-0'>
        <ListPagination
          totalRecords={data?.invoices?.totalCount}
          pageLimit={10}
          pageNeighbours={1}
          onPageChanged={onPageChanged}
          {...pagination}
        />
      </CardFooter>
    </Card>
  );
};

export default RecentInvoicesList;
