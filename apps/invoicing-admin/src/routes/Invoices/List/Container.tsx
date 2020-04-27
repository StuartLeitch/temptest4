import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Container, Row, Col } from './../../../components';

import { HeaderMain } from '../../components/HeaderMain';

import InvoicesList from './List';
import { InvoicesLeftNav } from '../../components/Invoices/InvoicesLeftNav';
import { ParseUtils } from '@utils';
import { useQueryState } from 'react-router-use-location-state';
import { useLocalStorage, writeStorage } from '@rehooks/local-storage';

// import QueryStateDisplay from './components/QueryStateDisplay';

const InvoicesContainer = (props: any) => {
  const defaultFilters = {
    invoiceStatus: [],
    transactionStatus: [],
    journalId: [],
    referenceNumber: '',
    customId: '',
  };
  const defaultPagination = {
    page: 1,
    offset: 0,
    limit: 10,
  };

  const [filters] = useLocalStorage('invoicesListFilters', defaultFilters);

  const [invoiceStatus, setInvoiceStatus] = useQueryState(
    'invoiceStatus',
    (filters as any).invoiceStatus
  );
  const [transactionStatus, setTransactionStatus] = useQueryState(
    'transactionStatus',
    (filters as any).transactionStatus
  );
  const [journalId, setJournalId] = useQueryState(
    'journalId',
    (filters as any).journalId
  );
  const [referenceNumber, setReferenceNumber] = useQueryState(
    'referenceNumber',
    (filters as any).referenceNumber
  );
  const [customId, setCustomId] = useQueryState(
    'customId',
    (filters as any).customId
  );

  Object.assign(filters, {
    invoiceStatus,
    transactionStatus,
    journalId,
    referenceNumber,
    customId,
  });

  const [pagination] = useLocalStorage(
    'invoicesListPagination',
    defaultPagination
  );

  const [page, setPage] = useQueryState(
    'page',
    (pagination || (defaultPagination as any)).page
  );

  Object.assign(pagination, { page });

  return (
    <React.Fragment>
      <Container fluid={true}>
        <HeaderMain title='Invoices' className='mb-5 mt-4' />
        <Row>
          <Col lg={3}>
            {/* <QueryStateDisplay queryState={{ ...filters, ...pagination }} /> */}
            <InvoicesLeftNav filters={filters} setFilter={setFilter} />
          </Col>
          <Col lg={9}>
            <InvoicesList
              filters={filters}
              pagination={pagination}
              setPage={setFilter}
            />
          </Col>
        </Row>
      </Container>
    </React.Fragment>
  );

  /**
   * Updates the filter given by `key` to the new `value`.
   *
   * @param key The key of the filter to be updated (e.g. 'invoiceStatus.FINAL')
   * @param value The value of the filter being updated (varies by input type)
   */
  function setFilter(key: string, value: boolean | string | any[]) {
    const [name, status] = ParseUtils.parseEvent(key);
    let newStatus = [];
    let newTransactionStatus = [];
    let newJournalId = [];

    switch (name) {
      case 'invoiceStatus':
        if (invoiceStatus.includes(status)) {
          newStatus = invoiceStatus.filter((s) => s !== status);
          setInvoiceStatus(newStatus);
        } else {
          newStatus = [...invoiceStatus, status];
          setInvoiceStatus(newStatus);
        }
        writeStorage('invoicesListFilters', {
          ...filters,
          invoiceStatus: newStatus,
        });
        setPage(1);
        writeStorage('invoicesListPagination', {
          ...pagination,
          page: 1,
        });

        break;

      case 'transactionStatus':
        if (transactionStatus.includes(status)) {
          newTransactionStatus = transactionStatus.filter((s) => s !== status);
          setTransactionStatus(newTransactionStatus);
        } else {
          newTransactionStatus = [...transactionStatus, status];
          setTransactionStatus(newTransactionStatus);
        }
        writeStorage('invoicesListFilters', {
          ...filters,
          transactionStatus: newTransactionStatus,
        });
        setPage(1);
        writeStorage('invoicesListPagination', {
          ...pagination,
          page: 1,
        });
        break;

      case 'journalTitle':
        newJournalId = (value as any[]).map((j) => j.journalId);
        setJournalId(newJournalId);
        writeStorage('invoicesListFilters', {
          ...filters,
          journalId: newJournalId,
        });
        setPage(1);
        writeStorage('invoicesListPagination', {
          ...pagination,
          page: 1,
        });
        break;

      case 'referenceNumber':
        setReferenceNumber(value as string);
        writeStorage('invoicesListFilters', {
          ...filters,
          referenceNumber: value,
        });
        setPage(1);
        writeStorage('invoicesListPagination', {
          ...pagination,
          page: 1,
        });
        break;

      case 'page':
        setPage(value as string);
        writeStorage('invoicesListPagination', {
          ...pagination,
          page: value,
        });
        break;

      default:
        setCustomId(value as string);
        writeStorage('invoicesListFilters', { ...filters, customId: value });
        setPage(1);
        writeStorage('invoicesListPagination', {
          ...pagination,
          page: 1,
        });
    }
  }
};

InvoicesContainer.propTypes = {
  match: PropTypes.object.isRequired,
};

export default InvoicesContainer;
