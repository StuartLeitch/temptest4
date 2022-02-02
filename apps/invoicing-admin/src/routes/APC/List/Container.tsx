import React, { useEffect, useCallback, useState } from 'react';
import { useManualQuery } from 'graphql-hooks';
import { useQueryState } from 'react-router-use-location-state';
import { Pagination } from 'antd';

import { APC_QUERY } from '../graphql';

import {
  Container,
  Row,
  Col,
  Error,
  ListPagination,
  CardFooter,
  Card,
  ButtonToolbar,
  // Button,
} from '../../../components';

import { HeaderMain } from '../../components/HeaderMain';
import { Loading } from '../../components';

import { Text, Table, Button, IconDownload } from '@hindawi/phenom-ui';

import List from './List';
import _ from 'lodash';

const defaultPaginationSettings = { page: 1, offset: 0, limit: 10 };

const ApcContainer: React.FC = () => {
  const [fetchJournals, { loading, error, data }] = useManualQuery(APC_QUERY);
  console.log(data?.invoicingJournals?.catalogItems);

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

  const downloadCSV = () => {
    // * build the query string out of query state
    let queryString = '?download=1&';
    queryString += `page=${page}&`;

    const url = `${(window as any)._env_.API_ROOT}/apc${queryString}`;

    const a = document.createElement('a');
    a.setAttribute('download', url);
    a.setAttribute('href', url);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };


  const columns = [
    {
      title: 'Journal Name',
      dataIndex: 'journalTitle',
      key: 'journalName',
    },
    {
      title: 'Journal Code',
      dataIndex: 'journalId',
      key: 'journalCode',
    },
    {
      title: 'ISSN',
      dataIndex: 'issn',
      key: 'issn',
    },
    {
      title: 'Publisher',
      dataIndex: 'publisherId',
      key: 'publisher',
      // render: (publishers: React.ReactNode) => (
      //   <Text type='success' strong>
      //     {publishers}
      //   </Text>
      // ),
    },
    {
      title: 'APC',
      dataIndex: 'amount',
      key: 'apc',
      render: (apc: React.ReactNode) => (
        <Text type='success' strong>
          {apc}
        </Text>
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
            {/* <List apcItems={data.invoicingJournals?.catalogItems} />
            <CardFooter className='d-flex justify-content-center pb-0'>
          </CardFooter> */}
            <Table
              columns={columns}
              dataSource={data.invoicingJournals?.catalogItems}
              // pagination={false}
              pagination={{
                total: data.invoicingJournals?.totalCount,
                current: page,
                onChange: (page, pageSize) => onPageChange({ currentPage: page}),
                showLessItems: true,
                showSizeChanger: false,
                showQuickJumper: false,
                // itemRender: (current, type, originalElement) => {

                //   if (type === 'prev') {
                //     return null;
                //   }

                //   if (type === 'jump-prev') {
                //     return '<<';
                //   }

                //   if (type === 'next') {
                //     return null;
                //   }

                //   if (type === 'jump-next') {
                //     return '>>'
                //   }


                //   return originalElement;
                // },
                position: ['bottomCenter']
              }}
            />
            {/* <ListPagination
              totalRecords={data.invoicingJournals?.totalCount}
              pageNeighbours={1}
              onPageChanged={onPageChange}
              pageLimit={defaultPaginationSettings.limit}
              currentPage={page}
            /> */}
          </Card>
        </>
      );

    return <Loading />;
  };

  return (
    <React.Fragment>
      <Container fluid={true}>
        <HeaderMain title='APC' className='mb-5 mt-4' />
        <Col lg={12} className='d-flex mb-3 mr-0 pr-0 px-0 my-sm-0'>
          <ButtonToolbar className='ml-auto'>
            {/* <Button color='twitter' className='mr-0' onClick={downloadCSV}>
              <i className='fas fa-download mr-2'></i>
              Download CSV
            </Button> */}
            <Button
              type='primary'
              onClick={downloadCSV}
              icon={<IconDownload />}
              iconRight
            >Download CSV</Button>
          </ButtonToolbar>
        </Col>
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
