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
import { CreditNotesLeftNav } from '../../components/CreditNotes/CreditNotesLeftNav';
import CreditNotesList from './CreditNoteList';
import SuccessfulUrlCopiedToClipboardToast from './components/SuccessfulUrlCopiedToClipboardToast';

const CreditNotesContainer: React.FC = () => {
  const defaultFilters = {
    reason: []
  };
  const defaultPagination = {
    page: 1,
    offset: 0,
    limit: 10,
  };

  const [reason, setReason] = useQueryState(
    'reason',
    (defaultFilters as any).reason
  );

  const [listState] = useLocalStorage('creditNotesList', { filters:defaultFilters, pagination: defaultPagination});
  let { filters, pagination } = listState;
  const queryFilters = {
    reason
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
      reason: _reason
    } = _filters;
    const { page: _page } = _pagination;

    // * build the query string out of query state
    let queryString = '';
    if (Object.keys(Object.assign({}, _filters, _pagination)).length) {
      queryString += '?';
      queryString += _reason.reduce(
        (qs, is) => (qs += `reason=${is}&`),
        ''
      );

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
          <Col lg={3}>
            <CreditNotesLeftNav filters={filters} setFilter={setFilter} />
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
            <CreditNotesList
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
    const [name, reason] = ParseUtils.parseEvent(key);
    let newReason = [];

    switch (name) {
      // * reason filter
      case 'reason':
        if (filters.reason.includes(reason)) {
          newReason = filters.reason.filter((s) => s !== reason);
        } else {
          newReason = [...filters.reason, reason];
        }

        setReason(newReason);
        setPage(1);
        writeStorage('creditNotesList', {
          filters: {
            ...filters,
            reason: newReason,
          },
          pagination: {
            ...pagination,
            page: 1
          }
        });
        break;

      // * pagination
      default:
        setPage(value as string);
        writeStorage('creditNotesList', {
          filters,
          pagination:{
            ...pagination,
            page: value,
            offset: Number(value) - 1,
          }
        });
        break;
    }
  }
};

export default CreditNotesContainer;
