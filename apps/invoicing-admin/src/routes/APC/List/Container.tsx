import React, { useEffect, useCallback, useState } from 'react';
import { useManualQuery, useMutation } from 'graphql-hooks';
import { useQueryState } from 'react-router-use-location-state';

import {
  APC_QUERY,
  APC_PUBLISHER_LIST_QUERY,
  CATALOG_ITEM_UPDATE,
} from '../graphql';

import Restricted from '../../../contexts/Restricted';
import NotAuthorized from '../../components/NotAuthorized';

import {
  Container,
  Row,
  Col,
  Error,
  Card,
  ButtonToolbar,
} from '../../../components';

import { HeaderMain } from '../../components/HeaderMain';
import { Loading } from '../../components';

import { Input, Form, InputNumber } from 'antd';

import { Text, Table, Menu, Select } from '@hindawi/phenom-ui';

import _ from 'lodash';

const { Option } = Select;
const defaultPaginationSettings = { page: 1, offset: 0, limit: 50 };

interface Item {
  id: string;
  journalId: string;
  journalTitle: string;
  code: string;
  publisher: string;
  publisherId: string;
  issn: string;
  amount: string;
}

const originData: Item[] = [];
interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: any;
  inputType: 'number' | 'text';
  record: Item;
  index: number;
  children: React.ReactNode;
}

const EditableCell: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode = inputType === 'number' ? <InputNumber /> : <Input />;

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required: true,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const ApcContainer: React.FC = () => {
  const [fetchJournals, { loading, error, data }] = useManualQuery(APC_QUERY);
  const [fetchPublishers, { data: publisherListData }] = useManualQuery(
    APC_PUBLISHER_LIST_QUERY
  );
  const [updateCatalogItem] = useMutation(CATALOG_ITEM_UPDATE);
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState('');
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
              <a target='_blank' rel='noopener noreferrer'>
                {name}
              </a>
            </Menu.Item>
          );
        })}
      ;
    </Menu>
  );

  const isEditing = (record: Item) => record.id === editingKey;

  const edit = (record: Partial<Item> & { id: string }) => {
    form.setFieldsValue({ amount: '', ...record });
    setEditingKey(record.id);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const [toUpdateData, setToUpdateData] = useState(originData);

  const save = async (journalId: string) => {
    try {
      const row = (await form.validateFields()) as Item;
      const newData = [...toUpdateData];
      const index = newData.findIndex((item) => journalId === item.journalId);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
        setToUpdateData(newData);
        setEditingKey('');
      } else {
        newData.push(row);
        setToUpdateData(newData);
        setEditingKey('');
        try {
          const updateCatalogItemResult = await updateCatalogItem({
            variables: {
              catalogItem: {
                amount: newData[0].amount,
                journalId,
              },
            },
          });

          const updateCatalogItemError =
            updateCatalogItemResult?.error?.graphQLErrors[0]['message'];

          if (!updateCatalogItemError) {
            fetchData(page);
            console.log('success');
          } else {
            console.log('fail');
          }
        } catch (e) {
          console.log(e.message);
        }
      }
    } catch (errInfo) {
      console.log(errInfo);
    }
  };

  const handleChange = (value) => {
    console.log(`selected ${value}`);
  };

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
      render: (publisher: any, record: Item) => {
        const editable = isEditing(record);
        return editable ? (
          <React.Fragment>
            <Select defaultValue={publisher} onChange={handleChange}>
              {publishers &&
                publishers.map((publisher, index) => {
                  const { name } = publisher;

                  return (
                    <Option key={index} value={name}>
                      {' '}
                      {name}
                    </Option>
                  );
                })}
            </Select>
          </React.Fragment>
        ) : (
          <Text>{publisher}</Text>
        );
      },
    },
    {
      title: 'APC',
      dataIndex: 'amount',
      key: 'amount',
      editable: true,
      width: 200,
      render: (apc: React.ReactNode) => (
        <Text type='success' strong>
          ${apc}
        </Text>
      ),
    },
    {
      title: '',
      dataIntes: 'action',
      render: (_: any, record: Item) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Text
              onClick={() => save(record.journalId)}
              style={{ marginRight: 8 }}
            >
              Save
            </Text>
            <Text onClick={cancel}>
              <a>Cancel</a>
            </Text>
          </span>
        ) : (
          <Text disabled={editingKey !== ''} onClick={() => edit(record)}>
            Edit
          </Text>
        );
      },
    },
  ];

  const Content = ({ loading, error, data }) => {
    if (loading) return <Loading />;

    if (error) return <Error error={error} />;

    const mergedColumns = columns.map((col) => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: (record: Item) => ({
          record,
          inputType: 'text',
          dataIndex: col.dataIndex,
          title: col.title,
          editing: isEditing(record),
        }),
      };
    });

    if (data)
      return (
        <>
          <Form form={form} component={false}>
            <Card className='mb-0 mt-5'>
              <Table
                columns={mergedColumns}
                components={{
                  body: {
                    cell: EditableCell,
                  },
                }}
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
          </Form>
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
