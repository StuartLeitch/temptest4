import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import React from 'react';

import {
  SuccessAnimation,
  Button,
  Title,
  Card,
  Text,
  Row,
  Col,
} from '@hindawi/phenom-ui';

const SuccessfulUpload = () => {
  const uploaded = useSelector((state) => (state as any).upload.zip);
  const navigate = useNavigate();

  const rows = (
    <Card bordered={false}>
      <Row gutter={[0, 16]}>
        <Col span={24}>
          <Card hoverable>{uploaded}</Card>
        </Col>
      </Row>
    </Card>
  );

  return (
    <Card className='success-upload-container'>
      <Title preset='small' className='success-upload-title'>
        Your zip file was uploaded and is now being validated!
      </Title>
      <SuccessAnimation />
      <Text className='small-text'>
        You will be notified over email when the validation process is
        completed.
        <br />
        It may take up to 15 minutes.
      </Text>
      {rows}
      <Row style={{ marginTop: '25px' }}>
        <Col flex={'auto'}></Col>
        <Col flex={'100px'}>
          <Button
            type='ghost'
            onClick={() => navigate('/transfer-manuscript')}
            disabled={false}
            style={{ marginRight: '25px' }}
          >
            TRANSFER NEW MANUSCRIPT
          </Button>
        </Col>
      </Row>
    </Card>
  );
};

export default SuccessfulUpload;
