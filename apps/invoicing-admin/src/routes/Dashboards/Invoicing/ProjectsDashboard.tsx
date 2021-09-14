import _ from 'lodash';
import React, { useState, useCallback, useEffect } from 'react';
import { useManualQuery } from 'graphql-hooks';
import { useQueryState } from 'react-router-use-location-state';

import { ParseUtils, Filters } from '@utils';

import {
  Container,
  Row,
  CustomInput,
  Button,
  Form,
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
    isReference: false,
    isManuscript: false,
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

  let queryParams = new URLSearchParams(window.location.search)

  let customIdParam = queryParams.get('customId')
  let referenceNumberParam = queryParams.get('referenceNumber')
  let pageParam = queryParams.get('page')

  let queryParamsFilter = {
    referenceNumber: referenceNumberParam,
    customId: customIdParam
  }

  let queryParamsPagination = {
    page: !pageParam ? defaultPagination.page : parseInt(pageParam),
    offset: defaultPagination.offset,
    limit: defaultPagination.limit,
  }

  // * When no query strings provided in the URL
  if (!_.isEqual(defaultFilters, queryParamsFilter)) {
    queryParamsFilter = Object.assign({}, defaultFilters, queryParamsFilter);
  }

  const [searchFilters, setSearchFilters] = useState(queryParamsFilter);

  const [value, setValue] = useState("");

  const [page, setPage] = useQueryState(
    'page',
    (defaultPagination as any).page
  );

  if (!_.isEqual(defaultPagination, { page, offset: 0, limit: 10 })) {
    queryParamsPagination = Object.assign({}, defaultPagination, {
      page,
      offset: page > 0 ? page - 1 : 0,
    });
  }

  let [fetchResults, { loading, error, data }] = useManualQuery(
    INVOICES_AND_CREDIT_NOTES_QUERY
  );

  const handleChange = (e) => {
    const re = /^[0-9\/]+$/;
    const trimmedInput = e.target.value.trim();
    if (trimmedInput === '' || re.test(trimmedInput)) {
       setValue(trimmedInput)
      }
  };

  const handleSearch = useCallback(async (ev: any) => {
    
    ev.preventDefault();
    
    
    const searchValue = (document.getElementById('search') as any).value;
    const isSearchByRefNumberChecked = (document.getElementById('searchByReferenceNumber') as any).checked;
    const isSearchByManuscriptIdChecked = (document.getElementById('searchByManuscriptId') as any).checked;

    if (_.isEmpty(searchValue)) return;

    if (isSearchByRefNumberChecked) {
      delete queryParamsFilter['customId'];
      queryParamsFilter['referenceNumber'] = searchValue;
      setFilter('referenceNumber', searchValue);
     
    }

    if (isSearchByManuscriptIdChecked) {
      delete queryParamsFilter['referenceNumber'];
      queryParamsFilter['customId'] = searchValue;
      setFilter('customId', searchValue)
    
    }

    setSearchFilters(queryParamsFilter);
    async function fetchData() {
      loading = true;
      const results = await fetchResults({
        variables: {
          filters: Filters.collect(queryParamsFilter),
          pagination: queryParamsPagination,
        },
      });
      loading = false;
      setSearchResults(results.data);
    }

    fetchData();
  }, [searchFilters]);
 
  useEffect(() => {
    async function fetchData() {
      
      const customId = queryParams.get('customId')
      const referenceNumber = queryParams.get('referenceNumber')


      const result = await fetchResults({
        variables: {
          filters: Filters.collect(queryParamsFilter),
          pagination: queryParamsPagination,
        },
      });

      const searchValue = referenceNumber || customId

      if(searchValue){
        setSearchResults(result.data)
        setValue(searchValue)
      }
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
          <Form onSubmit={handleSearch}>
            <InputGroup>
              {/*<Input placeholder='Search for...' className='bg-white' id="search" />*/}
              <Input
                maxLength={20}
                className="form-control bg-white"
                placeholder="Search for..."
                id="search"
                value = { value }
                onBlur={() => {}}
                onChange={handleChange}
              />
              <InputGroupAddon addonType='append'>
                <Button color='primary' onClick={handleSearch}>
                  <i className='fa fa-search'></i>
                </Button>
              </InputGroupAddon>
            </InputGroup>
          </Form>
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
                defaultChecked = {!!referenceNumberParam}
              />
              <CustomInput
                type='radio'
                id='searchByManuscriptId'
                name='searchBy'
                label='Manuscript Custom ID'
                inline
                defaultChecked = {!referenceNumberParam}
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
      break;

    case 'referenceNumber':
      setPage(1);
      setReferenceNumber(value as string);
      setCustomId(null);
      break;

    default:
      setPage(1);
      setCustomId(value as string);
      setReferenceNumber(null);
      break;
  }
  };
};

export default setupPage({
  pageTitle: 'Invoicing Dashboard'
})(ProjectsDashboard);
