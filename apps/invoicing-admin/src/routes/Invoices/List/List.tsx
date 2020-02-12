import React, { useEffect, useState } from 'react';
import { useManualQuery } from 'graphql-hooks';
import LoadingOverlay from 'react-loading-overlay';
import { Filters } from '@utils';

import {
  Card,
  CardFooter,
  Error,
  ListPagination,
  Spinner,
  Table
} from '../../../components';

import { TrTableInvoicesList } from './components/TrTableList';

const INVOICES_QUERY = `
query fetchInvoices(
  $filters: InvoiceFilters,
  $pagination: Pagination
) {
  invoices(
    filters: $filters
    pagination: $pagination
  ) {
    totalCount
    invoices {
      ...invoiceFragment
    }
  }
}
fragment invoiceFragment on Invoice {
  id: invoiceId
  status
  dateCreated
  dateIssued
  dateAccepted
  referenceNumber
  payer {
    ...payerFragment
  }
  invoiceItem {
    id
    price
    rate
    vat
    vatnote
    dateCreated
    coupons {
      ...couponFragment
    }
    waivers {
      ...waiverFragment
    }
    article {
      ...articleFragment
    }
  }
}
fragment payerFragment on Payer {
  id
  type
  name
  email
  vatId
  organization
  address {
    ...addressFragment
  }
}
fragment addressFragment on Address {
  city
  country
  state
  postalCode
  addressLine1
}
fragment couponFragment on Coupon {
  code
  reduction
}
fragment waiverFragment on Waiver {
  reduction
  type_id
}
fragment articleFragment on Article {
  id
  title
  created
  articleType
  authorCountry
  authorEmail
  customId
  journalTitle
  authorSurname
  authorFirstName
  journalTitle
}
`;

const RecentInvoicesList = props => {
  const paginator = {
    offset: 0,
    limit: 10
  };
  let [pagination, setPagination] = useState(paginator);

  const [fetchInvoices, { loading, error, data }] = useManualQuery(
    INVOICES_QUERY
  );

  // let currPaginator = { ...paginator };
  const onPageChanged = (data: any) => {
    // const filters = {
    //   invoiceStatus: []
    // };
    // if (props.filters.id === 'invoice-status-draft' && props.filters.checked) {
    //   filters.invoiceStatus = ['DRAFT'];
    // }

    // currPaginator = {
    //   offset: data?.currentPage - 1,
    //   limit: data?.pageLimit
    // };
    // setPagination({ ...currPaginator });
    setPagination({
      offset: data?.currentPage - 1,
      limit: data?.pageLimit
    });
    // fetchInvoices({
    //   // variables: { ...filters, ...currPaginator }
    //   variables: currPaginator
    // });
  };

  useEffect(() => {
    async function fetchData() {
      // setPagination({ ...paginator });
      await fetchInvoices({
        variables: {
          filters: Filters.collect(props.filters),
          // ...paginator
          pagination
        }
      });
    }
    fetchData();
  }, [props.filters, pagination]);

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

  if (error) return <Error data={error} />;

  const offset = pagination.offset * pagination.limit;
  if ((data?.length ?? 0 > 0) && offset >= data?.length) {
    // pagination.offset = 0; //({ ...pagination, offset: 0 });
    pagination = paginator;
  }

  return (
    <Card className='mb-0'>
      {/* START Table */}
      <div className='table-responsive-xl'>
        <Table className='mb-0 table-striped' hover>
          <thead>
            <tr>
              {/* <th className='align-middle bt-0'>#</th> */}
              <th className='align-middle bt-0'>Status</th>
              <th className='align-middle bt-0'>Reference</th>
              <th className='align-middle bt-0'>Manuscript Custom ID</th>
              <th className='align-middle bt-0'>Issue Date</th>
              <th className='align-middle bt-0'>APC</th>
              <th className='align-middle bt-0'>Journal Title</th>
              <th className='align-middle bt-0'>Manuscript Title</th>
              <th className='align-middle bt-0'>Manuscript Acceptance Date</th>
              {/* <th className='align-middle bt-0 text-right'>Actions</th> */}
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
          pageNeighbours={1}
          onPageChanged={onPageChanged}
          pageLimit={pagination.limit}
          currentPage={pagination.offset + 1}
        />
      </CardFooter>
    </Card>
  );
};

export default RecentInvoicesList;
