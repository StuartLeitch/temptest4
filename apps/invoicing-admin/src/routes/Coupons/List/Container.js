import React from 'react';
import PropTypes from 'prop-types';

import { Container, Row, Col } from './../../../components';

import { HeaderMain } from '../../components/HeaderMain';

import InvoicesList from './List';
import { InvoicesLeftNav } from '../../components/Invoices/InvoicesLeftNav';

const InvoicesContainer = ({}) => {
  return (
    <React.Fragment>
      <Container fluid={true}>
        <HeaderMain title='Invoices' className='mb-5 mt-4' />
        <Row>
          <Col lg={12}>
            {/* <InvoicesList filters={filters} /> */}
          </Col>
        </Row>
      </Container>
    </React.Fragment>
  );
};

export default InvoicesContainer;
