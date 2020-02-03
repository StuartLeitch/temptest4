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

// const INVOICES_QUERY = `
// query fetchInvoices(
//   $offset: Int,
//   $limit: Int
// ) {
//   invoices(offset: $offset, limit: $limit) {
//     totalCount
//     invoices {
//       ...invoiceFragment
//     }
//   }
// }
// fragment invoiceFragment on Invoice {
//   id: invoiceId
//   status
//   dateCreated
//   dateIssued
//   dateAccepted
//   referenceNumber
//   payer {
//     ...payerFragment
//   }
//   invoiceItem {
//     id
//     price
//     rate
//     vat
//     vatnote
//     dateCreated
//     coupons {
//       ...couponFragment
//     }
//     waivers {
//       ...waiverFragment
//     }
//     article {
//       ...articleFragment
//     }
//   }
// }
// fragment payerFragment on Payer {
//   id
//   type
//   name
//   email
//   vatId
//   organization
//   address {
//     ...addressFragment
//   }
// }
// fragment addressFragment on Address {
//   city
//   country
//   state
//   postalCode
//   addressLine1
// }
// fragment couponFragment on Coupon {
//   code
//   reduction
// }
// fragment waiverFragment on Waiver {
//   reduction
//   type_id
// }
// fragment articleFragment on Article {
//   id
//   title
//   created
//   articleType
//   authorCountry
//   authorEmail
//   customId
//   journalTitle
//   authorSurname
//   authorFirstName
//   journalTitle
// }
// `;

const INVOICES_QUERY = `
query fetchInvoices(
  $limit: Int
  $offset: Int
  $customId: String
  $referenceNumber: String
  $invoiceStatus: [InvoiceStatus]
  $transactionStatus: [TransactionStatus]
  $journalTitle: [String]
) {
  invoices(
    filtering: {
      invoices: {
        status: { in: $invoiceStatus }
        referenceNumber: { eq: $referenceNumber }
        invoiceItem: {
          article: {
            journalTitle: { in: $journalTitle }
            customId: { eq: $customId }
          }
        }
        transaction: { status: { in: $transactionStatus } }
      }
    }
    pagination: { limit: $limit, offset: $offset }
  ) {
    totalCount
    invoices {
      invoiceId
      status
      referenceNumber
    }
  }
}
`;

const RecentInvoicesList = props => {
  const paginator = {
    offset: 0,
    limit: 10
  };
  const [pagination, setPagination] = useState(paginator);

  const [fetchInvoices, { loading, error, data }] = useManualQuery(
    INVOICES_QUERY
  );

  let currPaginator = { ...paginator };
  const onPageChanged = (data: any) => {
    const filters = {
      invoiceStatus: []
    };
    if (props.filters.id === 'invoice-status-draft' && props.filters.checked) {
      filters.invoiceStatus = ['DRAFT'];
    }

    currPaginator = {
      offset: data?.currentPage - 1,
      limit: data?.pageLimit
    };
    setPagination({ ...currPaginator });
    fetchInvoices({
      variables: { ...filters, ...currPaginator }
    });
  };

  useEffect(() => {
    async function fetchData() {
      const { filters } = props;

      setPagination({ ...paginator });
      await fetchInvoices({
        variables: {
          ...filters,
          ...paginator
        }
      });
    }
    fetchData();
  }, [props.filters]);

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
              {/* <th className='align-middle bt-0'>#</th> */}
              <th className='align-middle bt-0'>Status</th>
              <th className='align-middle bt-0'>Reference</th>
              <th className='align-middle bt-0'>Issue Date</th>
              <th className='align-middle bt-0'>APC</th>
              <th className='align-middle bt-0'>Journal Title</th>
              <th className='align-middle bt-0'>Manuscript Custom ID</th>
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
          pageLimit={10}
          pageNeighbours={1}
          onPageChanged={onPageChanged}
          currentPage={pagination.offset + 1}
        />
      </CardFooter>
    </Card>
  );
};

export default RecentInvoicesList;
