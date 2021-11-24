import React, { useEffect, useCallback } from 'react';
import { useManualQuery } from 'graphql-hooks';
import { useQueryState } from 'react-router-use-location-state';
import DatePicker, { setDefaultLocale } from 'react-datepicker';
import moment from 'moment';

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
  Button
} from '../../../components';

import { HeaderMain } from '../../components/HeaderMain';
import { Loading } from '../../components';
import { AddonInput } from './components';

import List from './List';

setDefaultLocale('en');

const defaultPaginationSettings = { page: 1, offset: 0, limit: 10 };

const AuditLogsContainer: React.FC = () => {
  const [fetchLogs, { loading, error, data }] = useManualQuery(
    AUDIT_LOGS_QUERY
  );

  const [page, setPageInUrl] = useQueryState(
    'page',
    defaultPaginationSettings.page
  );

  const fetchData = useCallback(
    async (currentPage) => {
      await fetchLogs({
        variables: {
          pagination: {
            ...defaultPaginationSettings,
            page: currentPage,
            offset: currentPage - 1,
          },
        },
      });
    },
    [fetchLogs]
  );

  const onPageChange = (paginationData: { currentPage: number }) => {
    const { currentPage } = paginationData;

    fetchData(currentPage);
    setPageInUrl(currentPage);
  };

  useEffect(() => {
    fetchData(page);
  }, [fetchData, page, fetchLogs]);

  const Content = ({ loading, error, data }) => {

    if (loading) return <Loading />;

    if (error) return <Error error={error} />;

    if (data)
      return (
        <>
            <DatePicker
              className="ml-2"
              // customInput={ <AddonInput /> }
              selected={/* this.state.endDate */null}
              selectsEnd
              startDate={/* this.state.startDate */null}
              endDate={/* this.state.endDate */null}
              onChange={/* this.handleChangeEnd */() => void 0}
            />
            <DatePicker
              className="ml-2"
              // customInput={ <AddonInput /> }
              selected={/* this.state.endDate */null}
              selectsEnd
              startDate={/* this.state.startDate */null}
              endDate={/* this.state.endDate */null}
              onChange={/* this.handleChangeEnd */() => void 0}
            />
          <Card className='mb-0'>
            <List logs={data.auditlogs?.logs} />
            <CardFooter className='d-flex justify-content-center pb-0'>
              <ListPagination
                totalRecords={data.auditlogs?.totalCount}
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
        <HeaderMain title='Audit Logs' className='mb-5 mt-4' />
        <Row>
          <Col lg={12} className="mb-5">
            <Content {...{ loading, error, data }} />
          </Col>
        </Row>
      </Container>
    </React.Fragment>
  );
};

export default AuditLogsContainer;
