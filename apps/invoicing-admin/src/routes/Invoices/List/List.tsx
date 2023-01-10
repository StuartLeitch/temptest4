import React, { useEffect, useCallback } from 'react';
import { useManualQuery } from 'graphql-hooks';
import { useQueryState } from 'react-router-use-location-state';
import { Filters } from '@utils';

import { useLocalStorage } from '@rehooks/local-storage';
import { Table, Tag } from '@hindawi/phenom-ui';
import { Link } from 'react-router-dom';
import numeral from 'numeral';

import { Card, Error } from '../../../components';

import { Loading } from '../../components';
import { formatDate } from '../../../utils/date';

import { INVOICES_QUERY } from './graphql';

const RecentInvoicesList: React.FC<RecentInvoicesListProps> = (props) => {
  const { pagination: defaultPaginator } = props.state;

  const [{ pagination }] = useLocalStorage('invoicesList', {
    pagination: defaultPaginator,
  });

  const [fetchInvoices, { loading, error, data }] =
    useManualQuery(INVOICES_QUERY);

  const [page, setPageInUrl] = useQueryState('page', defaultPaginator.page);

  const fetchData = useCallback(
    async (currentPage) => {
      const { filters } = props.state;
      await fetchInvoices({
        variables: {
          filters: Filters.collect(filters),
          pagination: {
            ...defaultPaginator,
            page: currentPage,
            offset: currentPage - 1,
          },
        },
      });
    },
    [fetchInvoices, props.state]
  );

  const onPageChange = ({ currentPage }: any) => {
    props.setPage('page', currentPage);
    fetchData(currentPage);
    setPageInUrl(currentPage);
  };

  useEffect(() => {
    fetchData(page);
  }, [fetchData, page, fetchInvoices]);

  if (loading) return <Loading />;

  if (error) return <Error data={error as any} />;

  /*eslint-disable */
  const INVOICE_STATUS = {
    FINAL: (
      <Tag
        label='FINAL'
        style={{ background: 'transparent', color: '#1BD2AD' }}
      />
    ),
    ACTIVE: <Tag label='ACTIVE' status='success' />,
    DRAFT: <Tag label='DRAFT' status='info' />,
  };

  const columns = [
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: '9%',
      align: 'left' as const,
      render: (status) => INVOICE_STATUS[status],
    },
    {
      title: 'Manuscript Custom ID',
      dataIndex: 'id',
      key: 'customId',
      align: 'center' as const,
      width: '22%',
      render: (id, record) => (
        <Link to={`/invoices/details/${id}`} className='text-decoration-none'>
          {record?.invoiceItem?.article?.customId}
        </Link>
      ),
    },
    {
      title: 'Reference Number',
      dataIndex: 'referenceNumber',
      key: 'referenceNumber',
      align: 'center' as const,
      width: '20%',
      render: (referenceNumber, record) => (
        <Link
          to={`/invoices/details/${record.id}`}
          className='text-decoration-none'
        >
          {referenceNumber}
        </Link>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      align: 'right' as const,
      width: '15%',
      render: (totalPrice) => {
        return (
          <Tag
            label={numeral(totalPrice).format('$0.00')}
            status='success'
            large
          />
        );
      },
    },
    {
      title: 'Issued',
      dataIndex: 'dateIssued',
      key: 'dateIssued',
      align: 'right' as const,
      width: '17%',
      render: (date) => date && formatDate(new Date(date)),
    },
    {
      title: 'Accepted',
      dataIndex: 'dateAccepted',
      key: 'dateAccepted',
      align: 'right' as const,
      width: '17%',
      render: (date) => date && formatDate(new Date(date)),
    },
  ];

  return (
    <Card className='mb-0'>
      <Table
        className='invoices-table'
        columns={columns}
        rowKey={(record) => record.id}
        rowClassName={'table-row-light'}
        dataSource={data?.invoices?.invoices}
        pagination={{
          pageSize: 10,
          total: data?.invoices?.totalCount,
          current: page,
          onChange: (page, pageSize) => onPageChange({ currentPage: page }),
          showSizeChanger: false,
          position: ['bottomRight'],
          style: { paddingRight: '1em' },
        }}
      />
    </Card>
  );
};

interface RecentInvoicesListProps {
  state: {
    pagination: {
      page: number;
      offset: number;
      limit: number;
    };
    filters: {
      invoiceStatus: string[];
      transactionStatus: string[];
      journalId: string[];
      referenceNumber: string;
      customId: string;
    };
  };
  setPage(key: string, value: string | boolean | any[]): void;
}

export default RecentInvoicesList;
