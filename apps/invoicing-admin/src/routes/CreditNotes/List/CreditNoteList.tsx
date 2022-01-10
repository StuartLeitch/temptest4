import React, { useEffect, useCallback } from 'react';
import { useManualQuery } from 'graphql-hooks';
import { useLocalStorage } from '@rehooks/local-storage';
import { useQueryState } from 'react-router-use-location-state';
import { Filters } from '@utils';

import {
  Container,
  Card,
  CardFooter,
  Error,
  ListPagination,
} from '../../../components';

import { Loading } from '../../components';

import { CREDIT_NOTES_QUERY } from './graphql';
import { CreditNotesTableBody } from './components/TableBody';

const defaultPaginationSettings = { page: 1, offset: 0, limit: 10 };

const RecentCreditNotesList: React.FC<RecentCreditNotesListProps> = (props) => {
  const { pagination: defaultPaginator, filters } = props.state;

  const [{ pagination }] = useLocalStorage('creditNotesList', {
    pagination: defaultPaginator,
    filters,
  });

  const [fetchCreditNotes, { loading, error, data }] = useManualQuery(
    CREDIT_NOTES_QUERY
  );

  const [page, setPageInUrl] = useQueryState('page', defaultPaginator.page);

  const fetchData = useCallback(
    async (currentPage) => {
      const { filters } = props.state;

      await fetchCreditNotes({
        variables: {
          filters: Filters.collectCreditNotes(filters),
          pagination: {
            ...defaultPaginationSettings,
            page: currentPage,
            offset: currentPage - 1,
          },
        },
      });
    },
    [fetchCreditNotes, props.state]
  );

  const onPageChanged = ({ currentPage }: any) => {
    props.setPage('page', currentPage);
    fetchData(currentPage);
    setPageInUrl(currentPage);
  };

  useEffect(() => {
    fetchData(page);
  }, [fetchData, page, fetchCreditNotes]);

  if (loading) return <Loading />;
  if (error) return <Error data={error as any} />;

  if (data) {
    return (
      <Container fluid={true}>
        <Card className='mb-0'>
          <CreditNotesTableBody data={data?.getRecentCreditNotes} />
          <CardFooter className='d-flex justify-content-center pb-0'>
            <ListPagination
              totalRecords={data?.getRecentCreditNotes?.totalCount}
              pageNeighbours={5}
              onPageChanged={onPageChanged}
              pageLimit={pagination.limit}
              currentPage={pagination.page}
            />
          </CardFooter>
        </Card>
      </Container>
    );
  }

  return null;
};

interface RecentCreditNotesListProps {
  state: {
    pagination: {
      page: number;
      offset: number;
      limit: number;
    };
    filters: {
      reason: string[];
    };
  };
  setPage(key: string, value: string | boolean | any[]): void;
}

export default RecentCreditNotesList;
