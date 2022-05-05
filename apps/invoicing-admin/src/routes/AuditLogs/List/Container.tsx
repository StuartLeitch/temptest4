import React, { useEffect, useCallback, useState } from 'react';
import { useManualQuery } from 'graphql-hooks';
import { useQueryState } from 'react-router-use-location-state';
import DatePicker, { setDefaultLocale } from 'react-datepicker';
import axios from 'axios';
import moment from 'moment';
import { useAuth } from '../../../contexts/Auth';

import { AUDIT_LOGS_QUERY } from '../graphql';

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

import { Text, Table, Button, IconDownload } from '@hindawi/phenom-ui';

import { HeaderMain } from '../../components/HeaderMain';
import { Loading } from '../../components';
import { AddonInput } from './components';

import List from './List';
import _ from 'lodash';

setDefaultLocale('en');

const defaultPaginationSettings = { page: 1, offset: 0, limit: 10 };

const AuditLogsContainer: React.FC = () => {
  const auth: any = useAuth();
  const { token } = auth.data;

  const [fetchLogs, { loading, error, data }] =
    useManualQuery(AUDIT_LOGS_QUERY);

  const defaultFilters = {
    startDate: moment().subtract(5, 'days').toDate(),
    endDate: moment().toDate(),
  };

  const [startDate, setStartDate] = useQueryState(
    'startDate',
    defaultFilters.startDate
  );

  const [endDate, setEndDate] = useQueryState(
    'endDate',
    defaultFilters.endDate
  );

  const [page, setPageInUrl] = useQueryState(
    'page',
    defaultPaginationSettings.page
  );

  const queryParams = new URLSearchParams(window.location.search);
  const startDateParam = queryParams.get('startDate');
  const endDateParam = queryParams.get('endDate');

  const queryParamsFilter = {
    startDate: startDateParam,
    endDate: endDateParam,
  };

  const fetchData = useCallback(
    async (currentPage, startDate, endDate) => {
      await fetchLogs({
        variables: {
          pagination: {
            ...defaultPaginationSettings,
            page: currentPage,
            offset: currentPage - 1,
          },
          filters: {
            startDate,
            endDate,
          },
        },
      });
    },
    [fetchLogs]
  );

  const onPageChange = (paginationData: { currentPage: number }) => {
    const { currentPage } = paginationData;

    fetchData(currentPage, startDate, endDate);
    setPageInUrl(currentPage);
  };

  useEffect(() => {
    fetchData(page, startDate, endDate);
  }, []);

  const handleChangeStart = (startDate) => {
    setStartDate(startDate);
    fetchData(page, startDate, endDate);
  };
  const handleChangeEnd = (endDate) => {
    setEndDate(endDate);
    fetchData(page, startDate, endDate);
  };

  const downloadCSV = () => {
    // * build the query string out of query state
    let queryString = '?download=1&';
    queryString += `startDate=${moment(startDate).format('yyyy-MM-DD')}&`;
    queryString += `endDate=${moment(endDate).format('yyyy-MM-DD')}&`;

    const path = `${(window as any)._env_.API_ROOT}/logs${queryString}`;

    const config = {
      headers: {
        'content-type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    };
    axios.get(path, config).then((response) => {
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: 'text/csv;charset=utf-8;' })
      );
      const link = document.createElement('a');
      link.setAttribute('download', 'audit_logs.csv');
      link.setAttribute('href', url);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const columns = [
    {
      title: 'User Account',
      dataIndex: 'userAccount',
      key: 'userAccount',
      width: '22%',
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: '16%',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: '11%',
    },
    {
      title: 'Entity',
      dataIndex: 'entity',
      key: 'entity',
      width: '11%',
    },
    {
      title: 'Item Reference',
      dataIndex: 'item_reference',
      key: 'itemReference',
      width: '20%',
    },
    {
      title: 'Target Reference',
      dataIndex: 'target',
      key: 'targetReference',
      width: '20%',
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
              rowClassName={'table-row-light'}
              dataSource={data.auditlogs?.logs}
              pagination={{
                pageSize: 10,
                total: data.auditlogs?.totalCount,
                current: page,
                onChange: (page, pageSize) =>
                  onPageChange({ currentPage: page }),
                showLessItems: true,
                showSizeChanger: false,
                showQuickJumper: false,
                style: { paddingRight: '1em' },
                position: ['bottomRight'],
              }}
            />
          </Card>
        </>
      );

    return <Loading />;
  };

  return (
    <React.Fragment>
      <Container fluid={true}>
        <HeaderMain title='Audit Logs' className='mb-1 mt-5' />
        <Col lg={12} className='d-flex mb-3 mr-0 pr-0 px-0 my-sm-0'>
          <ButtonToolbar className='ml-auto audit-toolbar'>
            <span className='pl-1 pr-0 mr-1 mt-2 font-weight-bold'>From</span>
            <DatePicker
              className='ml-2 mr-0'
              customInput={<AddonInput />}
              dateFormat='dd/MM/yyyy'
              selected={startDate}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              onChange={handleChangeStart}
              maxDate={moment().toDate()}
              adjustDateOnChange
            />
            <span className='pl-2 pr-0 mr-0 mt-2 font-weight-bold'>To</span>
            <DatePicker
              className='ml-2 mr-2'
              customInput={<AddonInput />}
              dateFormat='dd/MM/yyyy'
              selected={endDate}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              onChange={handleChangeEnd}
              maxDate={new Date()}
            />
            <Button
              type='secondary'
              className='mr-0 audit-download-button'
              onClick={downloadCSV}
            >
              Export CSV
            </Button>
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

export default AuditLogsContainer;
