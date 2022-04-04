import React, { useEffect, useCallback, useState } from 'react';
import { useManualQuery, useMutation } from 'graphql-hooks';
import { useQueryState } from 'react-router-use-location-state';

import {
  APC_QUERY,
  APC_PUBLISHER_LIST_QUERY,
  CATALOG_ITEM_UPDATE,
} from '../graphql';

import {
  Container,
  Row,
  Col,
  Error,
  Card,
  ButtonToolbar,
} from '../../../components';

import Restricted from '../../../contexts/Restricted';
import { HeaderMain } from '../../components/HeaderMain';
import { Loading } from '../../components';

import {
  Form,
  Text,
  Table,
  IconEdit,
  IconSave,
  IconRemove,
  Space,
  Modal,
  IconNotificationAlert,
  Title,
  Button,
} from '@hindawi/phenom-ui';

import EditableCell from './components/EditableCell';
import { Item } from '../types';

import _ from 'lodash';

const defaultPaginationSettings = { page: 1, offset: 0, limit: 50 };

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

  const isEditing = (record: Item) => record.id === editingKey;

  const edit = (record: Partial<Item> & { id: string }) => {
    form.setFieldsValue({ amount: '', ...record });
    setEditingKey(record.id);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = async (journalId: string) => {
    try {
      const row = await form.validateFields();

      setEditingKey('');
      try {
        const updateCatalogItemResult = await updateCatalogItem({
          variables: {
            catalogItem: {
              amount: parseInt(row.amount),
              publisherName: row.publisher.name,
              journalId,
            },
          },
        });

        const updateCatalogItemError =
          updateCatalogItemResult?.error?.graphQLErrors[0]['message'];

        if (!updateCatalogItemError) {
          fetchData(page);
        }
      } catch (e) {
        console.error(e.message);
      }
    } catch (errInfo) {
      console.info('Validate Failed:', errInfo);
    }
  };

  const [isModalVisible, setIsModalVisible] = useState(false);

  const modalValidator = async () => {
    try {
      await form.validateFields();
      setIsModalVisible(true);
    } catch (errInfo) {
      console.info('Validate Failed:', errInfo);
    }
  };

  const handleOk = (record) => {
    setIsModalVisible(false);
    save(record.journalId);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const columns = [
    {
      title: 'Journal Name',
      dataIndex: 'journalTitle',
      key: 'journalName',
      width: '34%',
    },
    {
      title: 'Journal Code',
      dataIndex: 'code',
      key: 'code',
      width: '17%',
    },
    {
      title: 'ISSN',
      dataIndex: 'issn',
      key: 'issn',
      with: '17%',
    },
    {
      title: 'Publisher',
      dataIndex: ['publisher', 'name'],
      key: 'publisher',
      width: '11%',
      editable: true,
      render: (publisher: any) => <Text>{publisher}</Text>,
    },
    {
      title: 'APC',
      dataIndex: 'amount',
      key: 'amount',
      editable: true,
      align: 'right' as const,
      width: '11%',
      render: (apc: React.ReactNode) => (
        <Text type='success' strong>
          ${apc}
        </Text>
      ),
    },
    {
      title: '',
      dataIndex: 'action',
      width: '10%',
      render: (_: any, record: Item) => {
        const editable = isEditing(record);
        return editable ? (
          <Restricted to='edit.apc'>
            <span>
              <Space size={0} style={{ float: 'right', marginRight: '24px' }}>
                <Button
                  className='cancel-button'
                  type='text'
                  onClick={cancel}
                  icon={<IconRemove />}
                />
                <Button
                  className='save-button'
                  type='text'
                  onClick={modalValidator}
                  icon={<IconSave />}
                />
                <Modal
                  title={
                    <div className='modal-title-wrap'>
                      <IconNotificationAlert className='notification-input-icon' />
                      <Title
                        className='notification-input-tile'
                        preset='primary'
                      >
                        Do you want to save your changes?
                      </Title>
                    </div>
                  }
                  visible={isModalVisible}
                  onOk={() => handleOk(record)}
                  centered
                  onCancel={handleCancel}
                  okText='SAVE CHANGES'
                  cancelText='CANCEL'
                ></Modal>
              </Space>
            </span>
          </Restricted>
        ) : (
          <Restricted to='edit.apc'>
            <IconEdit className='edit-button' onClick={() => edit(record)} />
          </Restricted>
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
          publishers,
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
    </React.Fragment>
  );
};

export default ApcContainer;
