import React from 'react';

import { Container, Row, Col } from './../../../components';

import { HeaderMain } from '../../components/HeaderMain';

import List from './List';

const InvoicesContainer = () => {
  return (
    <React.Fragment>
      <Container fluid={true}>
        <HeaderMain title='Coupons' className='mb-5 mt-4' />
        <Row>
          <Col lg={12}>
            <List />
          </Col>
        </Row>
      </Container>
    </React.Fragment>
  );
};

export default InvoicesContainer;
