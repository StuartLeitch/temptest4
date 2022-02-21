import { useManualQuery, useMutation } from 'graphql-hooks';
import React, { useState } from 'react';
import axios from 'axios';

import {
  IconRemoveSolid,
  DragAndDrop,
  IconRemove,
  Alert,
  Title,
  Card,
} from '@hindawi/phenom-ui';

import { UPLOAD_FILE_MUTATION, UPLOAD_FILE_QUERY } from './graphql';

const controller = new AbortController();

const UploadDashboard = () => {
  const [fileList, setFileList] = useState([]);
  const [uploadError, setUploadError] = useState(null);
  const [retryProps, setRetryProps] = useState(null);

  const [confirmS3Upload] = useMutation(
    UPLOAD_FILE_MUTATION
  );

  const [
    createSignedUrl,
    { error },
  ] = useManualQuery(UPLOAD_FILE_QUERY);


  const props = {
    name: 'file',
    multiple: false, //toggle multiple file selection in file explorer
    accept: '.zip', //accepted formats, you can expand like 'format1, format2, etc.'
    maxCount: 1, //maximum files in the file list

    showUploadList: {
      removeIcon: <IconRemove />,
    },

    async handleUpload({ onSuccess, onError, file, onProgress} : any) {
      const { error, data } = await createSignedUrl({
        variables: {
          fileName: file.name,
        },
      });

      setRetryProps({onSuccess, onError, file, onProgress})

      if (error) {
        onError({ error });
        setUploadError(error);
        return false;
      }

      const { createSignedUrlForS3Upload } = data;

      const config = {
        headers: { 'content-type': 'application/zip' },
        signal: controller.signal,
        onUploadProgress: (event) => {
          const percent = Math.floor((event.loaded / event.total) * 100);

          onProgress({ percent });
        },
      };

      try {
        const res = await axios.put(
          createSignedUrlForS3Upload,
          file,
          config
        );
        onSuccess('Ok');
        setFileList([{
          uid: '0',
          name: file.name,
          status: 'success',
          size: res.config.data.size,
        }]);
      } catch (err) {
        console.error('Error: ', err);
        onError({ err });
        setUploadError(error);
      }
    },

    onRemove(file) {
      setFileList(fileList.filter((item) => item.id !== file.id));
      console.log(file);

      if (file.status === 'uploading') {
        controller.abort();
      }

      setUploadError(null)
    },

    onRetry() {
      setUploadError(null)
      retryProps.onProgress({percent: 0})
      props.handleUpload(retryProps)
    },

    disabledCheck(fileList) {
      return fileList?.every((file) => file.status !== 'success');
    },

    async handleChange({ file }) {
      if (file.status === 'removed') {
        setFileList([]);
      } else if (file.status === 'uploading') {
        setFileList([file]);
      } else if (file.status === 'done') {
        try{
          confirmS3Upload({
          variables: {
            confirmation: {
              fileName: file.name,
              location: 'foo'
            }
          },
        });
      }catch(err) {
        console.error('Error: ', err);
        setUploadError(error);
      }
      } else if (file.status === 'error') {
        setFileList([file]);
      } else {
        setFileList([file]);
      }

    }
  };

  return (
    <Card className='upload-container'>
      <Title preset='primary' className='upload-title'>
        Transfer Manuscript
      </Title>
      <DragAndDrop
        {...props}
        onChange={props.handleChange}
        fileList={fileList}
        customRequest={props.handleUpload}
        // magically set the `onRetry` prop through the props object
        // deconstruction, to avoid the type-checker, due to the props of the
        // drag and drop component are not augmented to the custom implementation
        onRemove={props.onRemove}
      />
      {uploadError && (
        <Alert
          style={{ marginTop: '20px' }}
          message='Error'
          description={uploadError.graphQLErrors[0].message}
          closeText={<IconRemoveSolid />}
          type='error'
        />
      )}
    </Card>
  );
};

export default UploadDashboard;
