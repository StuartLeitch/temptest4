import React, { useEffect, useCallback } from 'react';
import { useManualQuery } from 'graphql-hooks';
import { useQueryState } from 'react-router-use-location-state';

import {
  Container,
  Card,
  CardFooter,
  Error,
  ListPagination,
  Table,
} from '../../../components';

import { TrTableCreditNotesList } from './components/TrTableList';
import { Loading } from '../../components';
import { HeaderMain } from '../../components/HeaderMain';

import { CREDIT_NOTES_QUERY } from './graphql';

const defaultPaginationSettings = { page: 1, offset: 0, limit: 10 };

const RecentCreditNotesList: React.FC = () => {

  const [fetchCreditNotes, { loading, error, data }] = useManualQuery(
    CREDIT_NOTES_QUERY
  );

  const [page, setPageInUrl] = useQueryState(
    'page',
    defaultPaginationSettings.page
  );
  const fetchData = useCallback(
    async (currentPage) => {
      await fetchCreditNotes({
        variables: {
          pagination: {
            ...defaultPaginationSettings,
            page: currentPage,
            offset: currentPage - 1,
          },
        },
      });
    },
    [fetchCreditNotes]
  );

  const onPageChange = (paginationData: { currentPage: number }) => {
    const { currentPage } = paginationData;

    fetchData(currentPage);
    setPageInUrl(currentPage);
  };

  useEffect(() => {
    fetchData(page);
  }, [fetchData, page, fetchCreditNotes]);

  if (loading) return <Loading />;
  if (error) return <Error data={error as any} />;

  if(data) {
    
    return (
    <Container fluid = {true}>
      <HeaderMain title='Credit Notes' className='mb-5 mt-4' />
      <Card className='mb-0'>
        {/* START Table */}
        <div className='table-responsive-xl'>
          <Table className='mb-0 table-striped' hover>
            <thead>
              <tr>
                <th className='align-middle bt-0'>Reason</th>
                <th className='align-middle bt-0'>Reference</th>
                <th className='align-middle bt-0'>APC</th>
                <th className='align-middle bt-0'>Vat</th>
                <th className='align-middle bt-0'>Date Issued</th>
                <th className='align-middle bt-0'>Date Created</th>
              </tr>
            </thead>
            <tbody>
              <TrTableCreditNotesList creditNotes={data?.getRecentCreditNotes} />
            </tbody>
          </Table>
        </div>
        {/* END Table */}
        <CardFooter className='d-flex justify-content-center pb-0'>
          <ListPagination
            totalRecords={data?.getRecentCreditNotes?.totalCount}
            pageNeighbours={1}
            onPageChanged={onPageChange}
            pageLimit={defaultPaginationSettings.limit}
            currentPage={page}
          />
        </CardFooter>
      </Card>
    </Container>
    );
  }

    return <Loading />
};

export default RecentCreditNotesList;
