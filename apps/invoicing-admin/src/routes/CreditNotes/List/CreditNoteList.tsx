import React, { useEffect, useCallback } from 'react';
import { useManualQuery } from 'graphql-hooks';
import { useQueryState } from 'react-router-use-location-state';
import { useLocalStorage } from '@rehooks/local-storage';
import { Filters } from '@utils';

import {
  Container,
  Card,
  CardFooter,
  Error,
  ListPagination,
  Table,
} from '../../../components';

import { Loading } from '../../components';
import { HeaderMain } from '../../components/HeaderMain';

import { CREDIT_NOTES_QUERY } from './graphql';
import { CreditNotesTableBody } from './components/TableBody';

const defaultPaginationSettings = { page: 1, offset: 0, limit: 10 };

const RecentCreditNotesList: React.FC<RecentCreditNotesListProps> = (props) => {
  const { pagination: defaultPaginator, filters } = props.state;

  const [{ pagination }] = useLocalStorage(
    'creditNotesList',
    { pagination:  defaultPaginator, filters }
  );

  const [fetchCreditNotes, { loading, error, data }] = useManualQuery(
    CREDIT_NOTES_QUERY
  );

  const onPageChanged = ({ currentPage }: any) => {
    props.setPage('page', currentPage)
  };

  useEffect(() => {
    async function fetchData() {
      const { filters, pagination } = props.state;
      await fetchCreditNotes({
        variables: {
          filters: Filters.collect(filters),
          pagination,
        },
      });
    }
    fetchData();
  }, [fetchCreditNotes, props.state]);

  if (loading) return <Loading />;
  if (error) return <Error data={error as any} />;

  if (data) {
    return (
    <Container fluid = {true}>
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
    },
    filters: {
      reason: string[];
    }
  };
  setPage(key: string, value: string | boolean | any[]): void;
}

export default RecentCreditNotesList;
