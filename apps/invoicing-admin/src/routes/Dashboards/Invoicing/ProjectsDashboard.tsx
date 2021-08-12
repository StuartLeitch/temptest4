import _ from 'lodash';
import React, { useState, useCallback } from 'react';
import { useManualQuery } from 'graphql-hooks';
import { useQueryState } from 'react-router-use-location-state';
import { useLocalStorage, writeStorage } from '@rehooks/local-storage';

import { ParseUtils, Filters } from '@utils';

import {
  Container,
  Row,
  CustomInput,
  Button,
  Input,
  InputGroup,
  InputGroupAddon,
  FormGroup,
  Label,
  Col,
} from './../../../components';
import { setupPage } from './../../../components/Layout/setupPage';

import { HeaderMain } from '../../components/HeaderMain';
import SearchList from './SearchList';

import { INVOICES_AND_CREDIT_NOTES_QUERY } from '../../Invoices/List/graphql';
import InvoicesSearchResults from '../Invoicing/InvoicesSearchResults';
import CreditNotesSearchResults from '../Invoicing/CreditNotesSearchResults';

const ProjectsDashboard: React.FC = () => {
  const [searchResults, setSearchResults] = useState(null);

  const defaultFilters = {
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
  const [customId, setCustomId] = useQueryState(
    'customId',
    (defaultFilters as any).customId
  );

  const [listState] = useLocalStorage('searchList', { filters:defaultFilters, pagination: defaultPagination});
  let { filters, pagination } = listState;
  const queryFilters = {
    referenceNumber,
    customId,
  };

  // * When no query strings provided in the URL
  if (!_.isEqual(defaultFilters, queryFilters)) {
    filters = Object.assign({}, defaultFilters, queryFilters);
  }

  const [searchFilters, setSearchFilters] = useState(filters);

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

  let [fetchResults, { loading, error, data }] = useManualQuery(
    INVOICES_AND_CREDIT_NOTES_QUERY
  );

  const handleSearch = useCallback(async (eventTarget: any) => {
    const searchValue = (document.getElementById('search') as any).value;
    const isSearchByRefNumberChecked = (document.getElementById('searchByReferenceNumber') as any).checked;
    const isSearchByManuscriptIdChecked = (document.getElementById('searchByManuscriptId') as any).checked;

    if (_.isEmpty(searchValue)) return;


    if (isSearchByRefNumberChecked) {
      filters['referenceNumber'] = searchValue;
      delete filters['customId'];
    }

    if (isSearchByManuscriptIdChecked) {
      delete filters['referenceNumber'];
      filters['customId'] = searchValue;
    }

    setSearchFilters(filters);

    async function fetchData() {
      loading = true;
      const results = await fetchResults({
        variables: {
          filters: Filters.collect(filters),
          pagination,
        },
      });
      loading = false;

      setSearchResults(results.data);
    }

    fetchData();
  }, [searchFilters]);

  return (
    <Container>
      <Row className='mb-5'>
        <Col lg={12}>
          <HeaderMain title='Invoicing' className='mb-4 mb-lg-5' />
          {/* <p>
            Some words about how great <strong>Phenom Invoicing</strong> is and
            what you'll see in here&hellip;
          </p> */}
        </Col>
        <Col lg={12}>
          <InputGroup>
            <Input placeholder='Search for...' className='bg-white' id="search" />
            <InputGroupAddon addonType='append'>
              <Button color='primary' onClick={handleSearch}>
                <i className='fa fa-search'></i>
              </Button>
            </InputGroupAddon>
          </InputGroup>
        </Col>
        <Col lg={12}>
          <FormGroup row>
            <Label for='operatingSystem11' sm={1} className='pt-0 mt-2'>
              Search by
            </Label>
            <Col sm={11} className='pt-0 mt-2'>
              <CustomInput
                type='radio'
                id='searchByReferenceNumber'
                name='searchBy'
                label='Reference Number'
                inline
                defaultChecked
              />
              <CustomInput
                type='radio'
                id='searchByManuscriptId'
                name='searchBy'
                label='Manuscript ID'
                inline
              />
            </Col>
          </FormGroup>
        </Col>
        <Col lg={12} style={{ marginTop: '10px' }}>
          {
            searchResults && Object.keys(searchResults).map((category) => {
              let searchResultsToRender = null;
              switch (category) {
                case 'invoices':
                  searchResultsToRender = (
                    <InvoicesSearchResults
                      title={'invoices'}
                      data={searchResults['invoices']}
                    />);
                  break;
                case 'getRecentCreditNotes':
                  searchResultsToRender = (
                    <CreditNotesSearchResults
                      title={'credit notes'}
                      data={searchResults['getRecentCreditNotes']}
                    />);
                  break;
              }

              return (
                <SearchList
                  key={category}
                  component={searchResultsToRender}
                  loading={loading}
                  state={listState}
                  setPage={setFilter}
                />
              );
            })
          }
        </Col>
      </Row>
    </Container>
  )

  /**
 * Updates the filter given by `key` to the new `value`.
 *
 * @param key The key of the filter to be updated (e.g. 'invoiceStatus.FINAL')
 * @param value The value of the filter being updated (varies by input type)
 */
function setFilter(key: string, value: boolean | string | any[]) {
  const [name, status] = ParseUtils.parseEvent(key);

  switch (name) {
    case 'page':
      setPage(value as string);
      writeStorage('searchList', {
        filters,
        pagination:{
          ...pagination,
          page: value,
          offset: Number(value) - 1,
        }
      });
      break;

    case 'customId':
      setCustomId(value as string);
      setPage(1);
      writeStorage('searchList', {
        filters: { ...filters, customId: value },
        pagination: {
          ...pagination,
          page: 1,
        }
      });
    default:
      setPage(1);
      setReferenceNumber(value as string);
      writeStorage('searchList',{ filters: {
        ...filters,
        referenceNumber: value,
      }, pagination: {
        ...pagination,
        page: 1,
      }});
      break;
    }
  };
};

export default setupPage({
  pageTitle: 'Invoicing Dashboard'
})(ProjectsDashboard);
