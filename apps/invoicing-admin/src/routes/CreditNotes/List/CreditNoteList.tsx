import React, { useEffect, useCallback } from 'react';
import numeral from 'numeral';
import { Filters } from '@utils';
import { Link } from 'react-router-dom';
import { useManualQuery } from 'graphql-hooks';
import { useLocalStorage } from '@rehooks/local-storage';
import { useQueryState } from 'react-router-use-location-state';

import { Table, Tag, Text } from '@hindawi/phenom-ui';
import { Preset } from '@hindawi/phenom-ui/dist/Typography/Text';

import { Container, Card, Error } from '../../../components';
import { formatDate } from '../../../utils/date';

import { Loading } from '../../components';

import { CREDIT_NOTES_QUERY } from './graphql';
import {CREATION_REASON} from "./componentUtils";

const defaultPaginationSettings = { page: 1, offset: 0, limit: 10 };

const RecentCreditNotesList: React.FC<RecentCreditNotesListProps> = (props) => {
  const { pagination: defaultPaginator, filters } = props.state;

  const [{ pagination }] = useLocalStorage('creditNotesList', {
    pagination: defaultPaginator,
    filters,
  });

  const [fetchCreditNotes, { loading, error, data }] =
    useManualQuery(CREDIT_NOTES_QUERY);

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

  const onPageChange = ({ currentPage }: any) => {
    props.setPage('page', currentPage);
    fetchData(currentPage);
    setPageInUrl(currentPage);
  };

  useEffect(() => {
    fetchData(page);
  }, [fetchData, page, fetchCreditNotes]);

  if (loading) return <Loading />;
  if (error) return <Error data={error as any} />;

  const columns = [
    {
      title: 'Reason',
      dataIndex: 'creationReason',
      key: 'reason',
      width: '22%',
      render: (creationReason) => (
        <Text preset={Preset.PRIMARY}>{CREATION_REASON[creationReason]}</Text>
      ),
    },
    {
      title: 'Manuscript Custom ID',
      dataIndex: 'id',
      key: 'customID',
      align: 'center' as const,
      width: '24%',
      render: (id, record) => (
        <Link
          to={`/credit-notes/details/${id}`}
          className='text-decoration-none'
        >
          {record?.invoice?.invoiceItem?.article?.customId}
        </Link>
      ),
    },
    {
      title: 'Reference Number',
      dataIndex: 'persistentReferenceNumber',
      key: 'persistentReferenceNumber',
      align: 'center' as const,
      width: '20%',
      render: (referenceNumber, record) => (
        <Link
          to={`/credit-notes/details/${record.id}`}
          className='text-decoration-none'
        >
          {referenceNumber}
        </Link>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'price',
      key: 'price',
      align: 'right' as const,
      width: '17%',
      render: (price, record) => {
        // * applied coupons
        let coupons = 0;
        record.invoice.invoiceItem.coupons.forEach((c) => {
          coupons += c.reduction;
        });

        // * applied waivers
        let waivers = 0;
        record.invoice.invoiceItem.waivers.forEach((w) => {
          waivers += w.reduction;
        });

        const netCharges =
          record.invoice.invoiceItem.price *
          (1 - (coupons + waivers) / 100) *
          100;
        const total =
          netCharges + (netCharges * record.invoice.invoiceItem.vat) / 100;
        record.total = -(Math.round(total) / 100);

        return (
          <Tag
            label={numeral(record.total).format('$0.00')}
            status='error'
            large
          />
        );
      },
    },
    {
      title: 'Issued',
      dataIndex: 'dateIssued',
      key: 'issueDate',
      align: 'right' as const,
      width: '17%',
      render: (date) => date && formatDate(new Date(date)),
    },
  ];

  if (data) {
    return (
      <Container fluid={true}>
        <Card className='mb-0'>
          <Table
            className='creditNotes-table'
            columns={columns}
            rowKey={(record) => record.id}
            rowClassName={'table-row-light'}
            dataSource={data?.getRecentCreditNotes?.creditNotes}
            pagination={{
              pageSize: 10,
              total: data?.getRecentCreditNotes?.totalCount,
              current: page,
              onChange: (page, pageSize) => onPageChange({ currentPage: page }),
              showLessItems: true,
              showSizeChanger: false,
              showQuickJumper: false,
              position: ['bottomRight'],
              style: { paddingRight: '1em' },
            }}
          />
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
