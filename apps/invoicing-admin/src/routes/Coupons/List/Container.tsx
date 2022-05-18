import React, { useEffect, useCallback } from 'react';
import { useManualQuery } from 'graphql-hooks';
import { useQueryState } from 'react-router-use-location-state';
import { Link } from 'react-router-dom';

import { formatDate } from '../../../utils/date';
import { COUPONS_QUERY } from '../graphql';

import {
  Container,
  Row,
  Col,
  Error,
  Card,
  ButtonToolbar,
} from '../../../components';
import Restricted from '../../../contexts/Restricted';

import { Tag, Table, Button } from '@hindawi/phenom-ui';

import { HeaderMain } from '../../components/HeaderMain';
import { Loading } from '../../components';
import { NotAuthorized } from '../../components/NotAuthorized';

const defaultPaginationSettings = { page: 1, offset: 0, limit: 10 };

const CouponsContainer: React.FC = () => {
  const [fetchCoupons, { loading, error, data }] =
    useManualQuery(COUPONS_QUERY);

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

  const COUPON_STATUS = {
    ACTIVE: <Tag label='ACTIVE' status='success' />,
    INACTIVE: <Tag label='INACTIVE' status='error' />,
  };

  const dateRenderer = (date) => date && formatDate(new Date(date));

  const columns = [
    {
      title: 'Description',
      dataIndex: 'name',
      key: 'name',
      width: '16,8%',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: '9%',
    },
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      width: '11,2%',
      render: (code) => (
        <Link to={`/coupons/details/${code}`} className='text-decoration-none'>
          <Tag
            label={code}
            priority='low'
            style={{ cursor: 'pointer' }}
            light
            small
          />
        </Link>
      ),
    },
    {
      title: 'Discount',
      dataIndex: 'reduction',
      key: 'reduction',
      align: 'left' as const,
      width: '9%',
      render: (reduction) => <div>{reduction}%</div>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center' as const,
      width: '9%',
      render: (status) => COUPON_STATUS[status],
    },
    {
      title: 'Redeem Count',
      dataIndex: 'redeemCount',
      key: 'redeemCount',
      width: '12%',
      align: 'center' as const,
    },
    {
      title: 'Created',
      dataIndex: 'dateCreated',
      key: 'dateCreated',
      align: 'right' as const,
      width: '11%',
      render: dateRenderer,
    },
    {
      title: 'Updated',
      dataIndex: 'dateUpdated',
      key: 'dateUpdated',
      align: 'right' as const,
      width: '11%',
      render: dateRenderer,
    },
    {
      title: 'Expires On',
      dataIndex: 'expirationDate',
      key: 'expirationDate',
      align: 'right' as const,
      width: '11%',
      render: dateRenderer,
    },
  ];

  const Content = ({ loading, error, data }) => {
    if (loading) return <Loading />;

    if (error) return <Error error={error} />;

    if (data)
      return (
        <>
          <Card className='mb-0'>
            <Table
              columns={columns}
              rowKey={(record) => record.id}
              rowClassName={'table-row-light'}
              dataSource={data.coupons?.coupons}
              pagination={{
                pageSize: 10,
                total: data.coupons?.totalCount,
                current: page,
                onChange: (page, pageSize) =>
                  onPageChange({ currentPage: page }),
                showLessItems: true,
                showSizeChanger: false,
                showQuickJumper: false,
                position: ['bottomRight'],
                style: { paddingRight: '1em' },
              }}
            />
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
                  <Button type='secondary' className='mr-2'>
                    Create Coupon
                  </Button>
                </Link>
              </ButtonToolbar>
            </Restricted>
          </Col>
          <Row>
            <Col lg={12} className='mb-5'>
              <Content {...{ loading, error, data }} />
            </Col>
          </Row>
        </Container>
      </Restricted>
    </React.Fragment>
  );
};

export default CouponsContainer;
