import React, { useEffect, useCallback } from 'react';
import { useManualQuery } from 'graphql-hooks';
import { useQueryState } from 'react-router-use-location-state';

import { COUPONS_QUERY } from '../graphql';

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

const defaultPaginationSettings = { page: 1, offset: 0, limit: 10 };

const CouponsContainer = () => {
  const [fetchCoupons, { loading, error, data }] = useManualQuery(
    COUPONS_QUERY
  );

  const [page, setPageInUrl] = useQueryState(
    'page',
    defaultPaginationSettings.page
  );

  const fetchData = useCallback(
    async (currentPage) => {
      await fetchCoupons({
        variables: {
          pagination: {
            ...defaultPaginationSettings,
            page: currentPage,
            offset: currentPage - 1,
          },
        },
      });
    },
    [fetchCoupons]
  );

  const onPageChange = (paginationData: { currentPage: number }) => {
    const { currentPage } = paginationData;

    fetchData(currentPage);
    setPageInUrl(currentPage);
  };

  useEffect(() => {
    fetchData(page);
  }, [fetchData, page, fetchCoupons]);

  return (
    <React.Fragment>
      <Container fluid={true}>
        <HeaderMain title='Coupons' className='mb-5 mt-4' />
        <Row>
          <Col lg={12}>
            {loading && <Loading loading={loading} />}

            {error && <Error error={error} />}

            {data && (
              <>
                <Card className='mb-0'>
                  <List coupons={data.coupons.coupons} />
                  <CardFooter className='d-flex justify-content-center pb-0'>
                    <ListPagination
                      totalRecords={data.coupons.totalCount}
                      pageNeighbours={1}
                      onPageChanged={onPageChange}
                      pageLimit={defaultPaginationSettings.limit}
                      currentPage={page}
                    />
                  </CardFooter>
                </Card>
              </>
            )}
          </Col>
        </Row>
      </Container>
    </React.Fragment>
  );
};

export default CouponsContainer;
