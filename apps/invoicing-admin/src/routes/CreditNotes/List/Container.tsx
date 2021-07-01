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
import CreditNoteList from './CreditNoteList';
import SuccessfulUrlCopiedToClipboardToast from './components/SuccessfulUrlCopiedToClipboardToast';

const CreditNoteContainer: React.FC = () => {
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

  
  const [referenceNumber, setReferenceNumber] = useQueryState(
    'referenceNumber',
    (defaultFilters as any).referenceNumber
  );
  

  const [listState] = useLocalStorage('invoicesList', { filters:defaultFilters, pagination: defaultPagination});
  let { filters, pagination } = listState;
  const queryFilters = {
    referenceNumber,
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
      referenceNUmber: _referenceNumber,
    } = _filters;
    const { page: _page } = _pagination;

    // * build the query string out of query state
    let queryString = '';
    if (Object.keys(Object.assign({}, _filters, _pagination)).length) {
      queryString += '?';
    

      if (_referenceNumber) {
        queryString += `referenceNumber=${_referenceNumber}&`;
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
        <HeaderMain title='Credit Notes' className='mb-5 mt-4' />
        <Row>
          {/* <Col lg={3}>
            <InvoicesLeftNav filters={filters} setFilter={setFilter} />
          </Col> */}
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
              </ButtonGroup>
            </ButtonToolbar>
            <CreditNoteList
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
    const [name] = ParseUtils.parseEvent(key);
    switch (name) {

      default:
        setPage(value as string);
        writeStorage('invoicesList', {
          filters,
          pagination:{
            ...pagination,
            page: value,
            offset: Number(value) - 1,
          }
        });
    }
  }
};

export default CreditNoteContainer;
