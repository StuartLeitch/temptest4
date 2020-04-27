/* eslint-disable prefer-const */

import React, { useEffect } from 'react';
import { useManualQuery } from 'graphql-hooks';
import LoadingOverlay from 'react-loading-overlay';
import { Filters } from '@utils';
import { useLocalStorage } from '@rehooks/local-storage';

import {
  Button,
  ButtonGroup,
  ButtonToolbar,
  Card,
  CardFooter,
  Error,
  ListPagination,
  Spinner,
  Table,
  UncontrolledTooltip,
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
  cancelledInvoiceReference
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
  creditNote {
    ...creditNoteFragment
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
fragment creditNoteFragment on Invoice {
  invoiceId
  dateCreated
  cancelledInvoiceReference
  referenceNumber
}
`;

const RecentInvoicesList = (props) => {
  const { filters, pagination: defaultPaginator } = props;

  const [pagination] = useLocalStorage(
    'invoicesListPagination',
    defaultPaginator
  );

  const [fetchInvoices, { loading, error, data }] = useManualQuery(
    INVOICES_QUERY
  );

  const onPageChanged = ({ currentPage }: any) => {
    props.setPage('page', currentPage);
  };

  useEffect(() => {
    async function fetchData() {
      const vars = {
        filters: Filters.collect(props.filters),
        pagination,
      };
      await fetchInvoices({
        variables: vars,
      });
    }
    fetchData();
  }, [props.filters, pagination, fetchInvoices]);

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

  // const offset = pagination.offset * pagination.limit;
  // if (data?.length > 0 && offset >= data?.length) {
  //   pagination = Object.assign({}, paginator);
  // }

  const copyToClipboard = (str) => {
    const el = document.createElement('textarea');
    el.value = str;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  };

  const buildURLWithFilters = (filters, pagination) => {
    const {
      invoiceStatus,
      transactionStatus,
      journalId,
      referenceNumber,
      customId,
    } = filters;
    const { page } = pagination;

    // * build the query string out of query state
    let queryString = '';
    if (Object.keys(Object.assign({}, filters, pagination)).length) {
      queryString += '?';
      queryString += invoiceStatus.reduce(
        (qs, is) => (qs += `invoiceStatus=${is}&`),
        ''
      );
      queryString += transactionStatus.reduce(
        (qs, ts) => (qs += `transactionStatus=${ts}&`),
        ''
      );
      queryString += journalId.reduce(
        (qs, ji) => (qs += `journalId=${ji}&`),
        ''
      );

      if (referenceNumber) {
        queryString += `referenceNumber=${referenceNumber}&`;
      }

      if (customId) {
        queryString += `customId=${customId}&`;
      }

      if (page) {
        queryString += `page=${page}&`;
      }

      const { protocol, hostname, pathname } = window?.location;

      return `${protocol}://${hostname}${pathname}${queryString}`;
    }
  };

  return (
    <Card className='mb-0'>
      <ButtonToolbar className='d-flex justify-content-end'>
        <ButtonGroup className='mr-2'>
          <Button
            color='link'
            className='text-decoration-none align-self-center'
            id='tooltipFav'
            onClick={copyToClipboard(buildURLWithFilters(filters, pagination))}
          >
            <i className='text-blue fas fa-fw fa-share-square'></i>
          </Button>
          <UncontrolledTooltip placement='bottom' target='tooltipFav'>
            Share Search Filters
          </UncontrolledTooltip>
        </ButtonGroup>
      </ButtonToolbar>
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
          currentPage={pagination.page}
        />
      </CardFooter>
    </Card>
  );
};

export default RecentInvoicesList;
