import React from 'react';
import PropTypes from 'prop-types';

import { Container, Row, Col } from './../../../components';

import { HeaderMain } from '../../components/HeaderMain';

import InvoicesList from './List';
// import ProjectsGrid from './ProjectsGrid';
import { InvoicesLeftNav } from '../../components/Invoices/InvoicesLeftNav';
// import { InvoicesSmHeader } from '../../components/Invoices/InvoicesSmHeader';

const InvoicesContainer = props => (
  <React.Fragment>
    <Container fluid={true}>
      <HeaderMain title='Invoices' className='mb-5 mt-4' />
      <Row>
        <Col lg={3}>
          <InvoicesLeftNav />
        </Col>
        <Col lg={9}>
          {/* <InvoicesSmHeader
            subTitle={
              props.match.params.type === 'list'
                ? 'Projects List'
                : 'Projects Grid'
            }
            linkList='/apps/projects/list'
            linkGrid='/apps/projects/grid'
          />

          {props.match.params.type === 'list' ? ( */}
          <InvoicesList />
          {/* ) : (
            <ProjectsGrid />
          )} */}
        </Col>
      </Row>
    </Container>
  </React.Fragment>
);

InvoicesContainer.propTypes = {
  match: PropTypes.object.isRequired
};

export default InvoicesContainer;
