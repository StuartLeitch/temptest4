import _ from 'lodash';

import React from 'react';
import { useQueryState } from 'react-router-use-location-state';
import { useLocalStorage, writeStorage } from '@rehooks/local-storage';
import { toast } from 'react-toastify';

import { ParseUtils } from '@utils';
import {
  Container,
  Row,
  Col,
  Button,
  ButtonGroup,
  ButtonToolbar,
  UncontrolledTooltip,
} from './../../../components';
import { HeaderMain } from '../../components/HeaderMain';
import { InvoicesLeftNav } from '../../components/Invoices/InvoicesLeftNav';
import InvoicesList from './List';
import SuccessfulUrlCopiedToClipboardToast from './components/SuccessfulUrlCopiedToClipboardToast';

const InvoicesContainer: React.FC = () => {
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

  const [invoiceStatus, setInvoiceStatus] = useQueryState(
    'invoiceStatus',
    (defaultFilters as any).invoiceStatus
  );
  const [transactionStatus, setTransactionStatus] = useQueryState(
    'transactionStatus',
    (defaultFilters as any).transactionStatus
  );
  const [journalId, setJournalId] = useQueryState(
    'journalId',
    (defaultFilters as any).journalId
  );
  const [referenceNumber, setReferenceNumber] = useQueryState(
    'referenceNumber',
    (defaultFilters as any).referenceNumber
  );
  const [customId, setCustomId] = useQueryState(
    'customId',
    (defaultFilters as any).customId
  );

  const [listState] = useLocalStorage('invoicesList', { filters:defaultFilters, pagination: defaultPagination});
  let { filters, pagination } = listState;
  const queryFilters = {
    invoiceStatus,
    transactionStatus,
    journalId,
    referenceNumber,
    customId,
  };

  // * When no query strings provided in the URL
  if (!_.isEqual(defaultFilters, queryFilters)) {
    filters = Object.assign({}, defaultFilters, queryFilters);
  }

  const [page, setPage] = useQueryState(
    'page',
    (defaultPagination as any).page
  );

  if (!_.isEqual(defaultPagination, { page, offset: 0, limit: 10 })) {
    pagination = Object.assign({}, defaultPagination, {
      page,
      offset: page > 0 ? page - 1 : 0,
    });
  }

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

  const buildURLWithFilters = (_filters, _pagination) => {
    const {
      invoiceStatus: _invoiceStatus,
      transactionStatus: _transactionStatus,
      journalId: _journalId,
      referenceNUmber: _referenceNumber,
      customId: _customId,
    } = _filters;
    const { page: _page } = _pagination;

    // * build the query string out of query state
    let queryString = '';
    if (Object.keys(Object.assign({}, _filters, _pagination)).length) {
      queryString += '?';
      queryString += _invoiceStatus.reduce(
        (qs, is) => (qs += `invoiceStatus=${is}&`),
        ''
      );
      queryString += _transactionStatus.reduce(
        (qs, ts) => (qs += `transactionStatus=${ts}&`),
        ''
      );
      queryString += _journalId.reduce(
        (qs, ji) => (qs += `journalId=${ji}&`),
        ''
      );

      if (_referenceNumber) {
        queryString += `referenceNumber=${_referenceNumber}&`;
      }

      if (_customId) {
        queryString += `customId=${_customId}&`;
      }

      if (_page) {
        queryString += `page=${_page}&`;
      }

      const { protocol, hostname, pathname } = window?.location;

      return `${protocol}//${hostname}${pathname}${queryString}`;
    }
  };

  return (
    <React.Fragment>
      <Container fluid={true}>
        <HeaderMain title='Invoices' className='mb-5 mt-4' />
        <Row>
          <Col lg={3}>
            <InvoicesLeftNav filters={filters} setFilter={setFilter} />
          </Col>
          <Col lg={9} className='mt-n4 mb-5'>
            <ButtonToolbar className='d-flex justify-content-end'>
              <ButtonGroup className='mr-2'>
                <Button
                  color='link'
                  className='text-decoration-none align-self-center pr-0'
                  id='tooltipFav'
                  onClick={() => {
                    const urlToShare = buildURLWithFilters(filters, pagination);
                    copyToClipboard(urlToShare);
                    return toast.success(
                      <SuccessfulUrlCopiedToClipboardToast />
                    );
                  }}
                >
                  <i className='text-blue fas fa-fw fa-share-square'></i>
                </Button>
                <UncontrolledTooltip placement='bottom' target='tooltipFav'>
                  Share Search Filters
                </UncontrolledTooltip>
              </ButtonGroup>
            </ButtonToolbar>
            <InvoicesList
              state={listState}
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

    switch (name) {

      // * invoices status filter
      case 'invoiceStatus':
        if (filters.invoiceStatus.includes(status)) {
          newStatus = filters.invoiceStatus.filter((s) => s !== status);
        } else {
          newStatus = [...filters.invoiceStatus, status];
        }

        setInvoiceStatus(newStatus);
        setPage(1);
        writeStorage('invoicesList', {
          filters: {
            ...filters,
            invoiceStatus: newStatus,
          },
          pagination: {
            ...pagination,
            page: 1
          }
        });

        break;


      // * pagination
      case 'page':
        setPage(value as string);
        writeStorage('invoicesList', {
          filters,
          pagination:{
            ...pagination,
            page: value,
            offset: Number(value) - 1,
          }
        });
        break;


      // * transaction status filter
      default:
        if (filters.transactionStatus.includes(status)) {
          newTransactionStatus = filters.transactionStatus.filter(
            (s) => s !== status
          );
        } else {
          newTransactionStatus = [...filters.transactionStatus, status];
        }
        setTransactionStatus(newTransactionStatus);
        setPage(1);

        writeStorage('invoicesList', {
          filters: {
          ...filters,
          transactionStatus: newTransactionStatus,
        }, pagination: {
          ...pagination,
          page: 1,
        }});
        break;
    }
  }
};

export default InvoicesContainer;
