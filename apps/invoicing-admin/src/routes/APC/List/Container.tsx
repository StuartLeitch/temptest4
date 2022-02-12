import React, { useEffect, useCallback } from 'react';
import { useManualQuery } from 'graphql-hooks';
import { useQueryState } from 'react-router-use-location-state';
import { Pagination } from 'antd';

import { APC_QUERY, APC_PUBLISHER_LIST_QUERY } from '../graphql';

import Restricted from '../../../contexts/Restricted';
import NotAuthorized from '../../components/NotAuthorized';

import {
  Container,
  Row,
  Col,
  Error,
  ListPagination,
  CardFooter,
  Card,
  ButtonToolbar,
} from '../../../components';

import { HeaderMain } from '../../components/HeaderMain';
import { Loading } from '../../components';

import {
  Text,
  Table,
  Space,
  Dropdown,
  Button,
  IconDownload,
  Menu,
} from '@hindawi/phenom-ui';

import _ from 'lodash';

const defaultPaginationSettings = { page: 1, offset: 0, limit: 50 };

const ApcContainer: React.FC = () => {
  const [fetchJournals, { loading, error, data }] = useManualQuery(APC_QUERY);

  const [fetchPublishers, { data: publisherListData }] = useManualQuery(
    APC_PUBLISHER_LIST_QUERY
  );

  const [page, setPageInUrl] = useQueryState(
    'page',
    defaultPaginationSettings.page
  );

  const fetchPublisherList = useCallback(
    async (currentPage) => {
      await fetchPublishers({
        variables: {
          pagination: {
            ...defaultPaginationSettings,
            page: currentPage,
            offset: currentPage - 1,
          },
        },
      });
    },
    [fetchPublishers]
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
    fetchPublisherList(page);
  }, []);

  const publishers = publisherListData?.getPublishers.publishers;

  const menu = (
    <Menu>
      {publishers &&
        publishers.map((publisher, index) => {
          const { name } = publisher;

          return (
            <Menu.Item key={index}>
              <a
                target='_blank'
                rel='noopener noreferrer'
                href='https://www.antgroup.com'
              >
                {name}
              </a>
            </Menu.Item>
          );
        })}
      ;
    </Menu>
  );

  const columns = [
    {
      title: 'Journal Name',
      dataIndex: 'journalTitle',
      key: 'journalName',
      width: 450,
    },
    {
      title: 'Journal Code',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'ISSN',
      dataIndex: 'issn',
      key: 'issn',
    },
    {
      title: 'Publisher',
      dataIndex: ['publisher', 'name'],
      key: 'publisher',
      render: (publisher: React.ReactNode) => (
        <React.Fragment>
          <Dropdown overlay={menu} trigger={['click']}>
            <a
              className='ant-dropdown-link'
              onClick={(e) => e.preventDefault()}
            >
              {publisher}
            </a>
          </Dropdown>
        </React.Fragment>
      ),
    },
    {
      title: 'APC',
      dataIndex: 'amount',
      key: 'apc',
      render: (apc: React.ReactNode) => (
        <React.Fragment>
          <Text type='success' strong>
            ${apc}
          </Text>
          <Space size='middle'>
            <a>Edit</a>
            <a className='ant-dropdown-link'>More actions</a>
          </Space>
        </React.Fragment>
      ),
    },
  ];

  const Content = ({ loading, error, data }) => {
    if (loading) return <Loading />;

    if (error) return <Error error={error} />;

    if (data)
      return (
        <>
          <Card className='mb-0 mt-5'>
            <Table
              columns={columns}
              rowKey={(record) => record.id}
              rowClassName={(record, index) =>
                index % 2 === 0 ? 'table-row-light' : 'table-row-dark'
              }
              dataSource={data.invoicingJournals?.catalogItems}
              pagination={{
                pageSize: 50,
                total: data.invoicingJournals?.totalCount,
                current: page,
                onChange: (page, pageSize) =>
                  onPageChange({ currentPage: page }),
                showLessItems: true,
                showSizeChanger: false,
                showQuickJumper: false,
                position: ['bottomCenter'],
              }}
            />
          </Card>
        </>
      );

    return <Loading />;
  };

  return (
    <React.Fragment>
      <Restricted to='list.apc' fallback={<NotAuthorized />}>
        <Container fluid={true}>
          <HeaderMain title='APC' className='mb-1 mt-5' />
          <Col lg={12} className='d-flex mb-3 mr-0 pr-0 px-0 my-sm-0'>
            <ButtonToolbar className='ml-auto'>
              {/* <Button
              type='primary'
              onClick={downloadCSV}
              icon={<IconDownload />}
              iconRight
            >
              Download CSV
            </Button> */}
            </ButtonToolbar>
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

export default ApcContainer;
