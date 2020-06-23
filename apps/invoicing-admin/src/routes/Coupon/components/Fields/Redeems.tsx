import React from 'react';

import { Row, Col } from '../../../../components';

const Redeems: React.FC<RedeemsProps> = ({ value = null }) => {
  return (
    <Row className='mb-4'>
      <Col className='font-weight-bold' sm={3}>
        Redeems
      </Col>
      <Col sm={9}>{value}</Col>
    </Row>
  );
};

interface RedeemsProps {
  value?: number;
}

export default Redeems;
