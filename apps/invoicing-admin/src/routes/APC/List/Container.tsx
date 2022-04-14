import React, { useEffect, useCallback, useState } from 'react';
import { useManualQuery, useMutation } from 'graphql-hooks';
import { useQueryState } from 'react-router-use-location-state';
import axios, { AxiosError } from 'axios';
import { useAuth } from '../../../contexts/Auth';

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
import NotAuthorized from '../../components/NotAuthorized';
import { Loading } from '../../components';

import { Upload } from 'antd';

import {
  Form,
  Text,
  Table,
  Space,
  Button,
  IconEdit,
  IconSave,
  IconRemove,
  Modal,
  IconNotificationAlert,
  IconNotificationError,
  IconNotificationSuccess,
  Title,
} from '@hindawi/phenom-ui';

import EditableCell from './components/EditableCell';
import { Item } from '../types';

import _ from 'lodash';
import { Preset } from '@hindawi/phenom-ui/dist/Typography/Text';

const defaultPaginationSettings = { page: 1, offset: 0, limit: 50 };

const ApcContainer: React.FC = () => {
  const auth: any = useAuth();
  const { token } = auth.data;

  const [fetchJournals, { loading, error, data }] = useManualQuery(APC_QUERY);
  const [fetchPublishers, { data: publisherListData }] = useManualQuery(
    APC_PUBLISHER_LIST_QUERY
  );
  const [updateCatalogItem] = useMutation(CATALOG_ITEM_UPDATE);
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState('');
  const [modalError, setModalError] = useState('');
  const [fileList, setFileList] = useState([]);
  const [hasFile, setHasFile] = useState(false);
  const [hasSucceed, setHasSucceed] = useState(false);
  const [hasNoUpdate, setHasNoUpdate] = useState(false);
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

  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const modalValidator = async () => {
    try {
      await form.validateFields();
      setIsEditModalVisible(true);
    } catch (errInfo) {
      console.info('Validate Failed:', errInfo);
    }
  };

  const handleOk = (record) => {
    setIsEditModalVisible(false);
    save(record.journalId);
  };

  const handleCancel = () => {
    setIsEditModalVisible(false);
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
                    <div className='modal-title-wrap-edit'>
                      <IconNotificationAlert className='notification-input-icon-edit' />
                      <Title
                        className='notification-input-title-edit'
                        preset='primary'
                      >
                        Do you want to save your changes?
                      </Title>
                    </div>
                  }
                  visible={isEditModalVisible}
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
            <Card className='mb-0 mt-4'>
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

  const props = {
    name: 'file',
    multiple: false,
    accept: '.csv',
    headers: {
      authorization: 'authorization-text',
    },

    async handleUploadCSV(options) {
      const { onSuccess, onError, file } = options;
      const fmData = new FormData();
      const url = `${(window as any)._env_.API_ROOT}/apc/upload-csv`;
      const config = {
        headers: {
          'content-type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      };
      fmData.append('file', file);
      try {
        const res = await axios.post(url, fmData, config);
        onSuccess('Ok');
        switch (res.status) {
          case 204:
            setHasFile(false);
            setHasSucceed(true);
            setHasNoUpdate(true);
            break;

          case 200:
            fetchData(page);
            setHasFile(false);
            setHasSucceed(true);
            setHasNoUpdate(false);
            break;
        }
      } catch (error) {
        const err = error as AxiosError;
        console.info('Error: ', err.response.data);
        onError({ err });
        setHasFile(false);
        setHasSucceed(false);
        setModalError(err.response.data);
      }
      setIsUploadModalVisible(true);
    },

    handleChange({ fileList }) {
      setFileList(fileList);
      setHasFile(true);
    },
  };

  const handleUploadModalClose = () => {
    setIsUploadModalVisible(false);
  };

  const handleDownloadCSV = () => {
    const config = {
      headers: {
        'content-type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    };
    const path = `${(window as any)._env_.API_ROOT}/apc`;
    axios.get(path, config).then((response) => {
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: 'text/csv;charset=utf-8;' })
      );
      const link = document.createElement('a');
      link.setAttribute('download', 'apc.csv');
      link.setAttribute('href', url);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  return (
    <React.Fragment>
      <Restricted to='list.apc' fallback={<NotAuthorized />}>
        <Container fluid={true}>
          <Title preset='primary' className='apc-header'>
            APC
          </Title>
          <Col lg={12} className='d-flex mb-3 mr-0 pr-0 px-0 my-sm-0'>
            <ButtonToolbar className='ml-auto'>
              <Space size={8}>
                <Button type='secondary' onClick={handleDownloadCSV}>
                  Export CSV
                </Button>
                <Form>
                  <Modal
                    title={
                      <div className='modal-title-wrap-upload'>
                        {hasSucceed ? (
                          <React.Fragment>
                            {hasNoUpdate ? (
                              <React.Fragment>
                                <IconNotificationAlert className='notification-input-icon' />
                                <Title
                                  className='notification-input-title'
                                  preset='small'
                                >
                                  No APCs were updated!
                                </Title>
                              </React.Fragment>
                            ) : (
                              <React.Fragment>
                                <IconNotificationSuccess className='notification-input-icon' />
                                <Title
                                  className='notification-input-title'
                                  preset='small'
                                >
                                  APCs updated with success!
                                </Title>
                              </React.Fragment>
                            )}
                          </React.Fragment>
                        ) : (
                          <React.Fragment>
                            <IconNotificationError className='notification-input-icon' />
                            <Title
                              className='notification-input-title-error'
                              preset='primary'
                            >
                              The APCs couldn't be updated!
                              <Text
                                className='notification-subtitle'
                                preset={Preset.MESSAGE}
                              >
                                {modalError}
                              </Text>
                            </Title>
                          </React.Fragment>
                        )}
                      </div>
                    }
                    visible={isUploadModalVisible}
                    onOk={handleUploadModalClose}
                    onCancel={handleUploadModalClose}
                    centered
                    okText='CLOSE'
                    cancelButtonProps={{ style: { display: 'none' } }}
                    okButtonProps={{ size: 'large' }}
                  />
                  <Restricted to='edit.apc'>
                    <Upload
                      {...props}
                      className='csv-upload'
                      onChange={props.handleChange}
                      customRequest={props.handleUploadCSV}
                      showUploadList={false}
                    >
                      <Button
                        className='csv-upload-button'
                        disabled={hasFile}
                        type='secondary'
                      >
                        Import CSV
                      </Button>
                    </Upload>
                  </Restricted>
                </Form>
              </Space>
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
