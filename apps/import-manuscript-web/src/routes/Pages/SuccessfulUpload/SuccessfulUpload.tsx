import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import React from 'react';
import {
  SuccessAnimation,
  CollapsiblePanel,
  Button,
  Title,
  Card,
  Text,
  Row,
  Col,
} from '@hindawi/phenom-ui';

const SuccessfulUpload = () => {
  const uploaded = useSelector((state) => (state as any).upload.zip);
  const history = useHistory();

  const rows = (
    <Card bordered={false}>
      <Row gutter={[0, 16]}>
        <Col span={24}>
          <Card hoverable>{uploaded}</Card>
        </Col>
      </Row>
   </Card>
  );

  const InfoCmp = () => <Text type='success'><strong>4</strong> packages</Text>;

  return (
    <Card className='success-upload-container'>
      <Title preset='small' className='success-upload-title'>
        Your zip file was uploaded and is now being validated!
      </Title>
      <SuccessAnimation />
      <Text className='small-text'>You will be notified over email when the validation process is completed.<br />It may take up to 15 minutes.</Text>
      {/* <CollapsiblePanel
        highlighted={false}
        header='Uploaded Manuscripts List'
        content={rows}
        info={<InfoCmp />}
      /> */}
      {rows}
      <Row style={{ marginTop: '25px'}}>
        <Col flex={'auto'}></Col>
        <Col flex={'100px'}>
          <Button
            type='ghost'
            onClick={() => history.push('/transfer-manuscript')}
            disabled={false}
            style={{ marginRight: '25px' }}
          >
            TRANSFER NEW MANUSCRIPT
          </Button>
        </Col>
        {/* <Col flex={'100px'}>
          <Button
            icon={null}
            onClick={() => void 0}
            type="primary"
          >
            GO TO DASHBOARD
          </Button>
        </Col> */}
      </Row>
    </Card>
  );
};

export default SuccessfulUpload;
