import React, { useEffect, useCallback, useState } from 'react';
import { useManualQuery, useQuery } from 'graphql-hooks';
import { useQueryState } from 'react-router-use-location-state';

import { APC_QUERY, APC_PUBLISHER_QUERY } from '../graphql';

import {
  Container,
  Row,
  Col,
  Error,
  ListPagination,
  CardFooter,
  Card,
} from '../../../components';

import { HeaderMain } from '../../components/HeaderMain';
import { Loading } from '../../components';

import List from './List';
import _ from 'lodash';

const defaultPaginationSettings = { page: 1, offset: 0, limit: 50 };

const ApcContainer: React.FC = () => {
  const [fetchJournals, { loading, error, data }] = useManualQuery(APC_QUERY);

  const [page, setPageInUrl] = useQueryState(
    'page',
    defaultPaginationSettings.page
  );

  const fetchData = useCallback(
    async (currentPage) => {
      await fetchJournals({
        variables: {
          pagination: {
            ...defaultPaginationSettings,
            page: currentPage,
            offset: currentPage - 1,
          },
        },
      });
    },
    [fetchJournals]
  );

  const onPageChange = (paginationData: { currentPage: number }) => {
    const { currentPage } = paginationData;

    fetchData(currentPage);
    setPageInUrl(currentPage);
  };

  useEffect(() => {
    fetchData(page);
  }, []);

  const Content = ({ loading, error, data }) => {
    if (loading) return <Loading />;

    if (error) return <Error error={error} />;

    if (data)
      return (
        <>
          <Card className='mb-0 mt-5'>
            <List apcItems={data.invoicingJournals?.catalogItems} />
            <CardFooter className='d-flex justify-content-center pb-0'>
              <ListPagination
                totalRecords={data.invoicingJournals?.totalCount}
                pageNeighbours={1}
                onPageChanged={onPageChange}
                pageLimit={defaultPaginationSettings.limit}
                currentPage={page}
              />
            </CardFooter>
          </Card>
        </>
      );

    return <Loading />;
  };

  return (
    <React.Fragment>
      <Container fluid={true}>
        <HeaderMain title='APC' className='mb-5 mt-4' />
        <Row>
          <Col lg={12} className='mb-5'>
            <Content {...{ loading, error, data }} />
          </Col>
        </Row>
      </Container>
    </React.Fragment>
  );
};

export default ApcContainer;
