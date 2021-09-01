import React, { useEffect, useCallback } from 'react';
import { useManualQuery } from 'graphql-hooks';
import { useQueryState } from 'react-router-use-location-state';
import { Link } from 'react-router-dom';

import { COUPONS_QUERY } from '../graphql';

import {
  Container,
  Row,
  Col,
  Error,
  ListPagination,
  CardFooter,
  Card,
  ButtonToolbar,
  Button,
} from '../../../components';
import Restricted from '../../../contexts/Restricted';

import { HeaderMain } from '../../components/HeaderMain';
import { Loading } from '../../components';
import NotAuthorized from '../../components/NotAuthorized';

import List from './List';

const defaultPaginationSettings = { page: 1, offset: 0, limit: 10 };

const CouponsContainer: React.FC = () => {
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

  const Content = ({ loading, error, data }) => {
    if (loading) return <Loading />;

    if (error) return <Error error={error} />;

    if (data)
      return (
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
      );

    return <Loading />;
  };

  return (
    <React.Fragment>
      <Restricted to='list.coupons' fallback={<NotAuthorized />}>
      <Container fluid={true}>
        <HeaderMain title='Coupons' className='mb-5 mt-4' />
        <Col lg={12} className='d-flex mb-3 mr-0 pr-0'>
          <Restricted to='create.coupon'>
            <ButtonToolbar className='ml-auto'>
              <Link to={`/coupons/create`}>
                <Button color='twitter' className='mr-2'>
                  <i className='fas fa-plus mr-2'></i>
                  Create Coupon
                </Button>
              </Link>
            </ButtonToolbar>
          </Restricted>
        </Col>
        <Row>
          <Col lg={12} className="mb-5">
            <Content {...{ loading, error, data }} />
          </Col>
        </Row>
      </Container>
      </Restricted>
    </React.Fragment>
  );
};

export default CouponsContainer;
