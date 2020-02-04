import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { Container, Row, Col } from './../../../components';

import { HeaderMain } from '../../components/HeaderMain';

import InvoicesList from './List';
// import ProjectsGrid from './ProjectsGrid';
import { InvoicesLeftNav } from '../../components/Invoices/InvoicesLeftNav';
// import { InvoicesSmHeader } from '../../components/Invoices/InvoicesSmHeader';

const createPath = (obj, path, value = null) => {
  path = typeof path === 'string' ? path.split('.') : path;
  let current = obj;
  while (path.length > 1) {
    const [head, ...tail] = path;
    path = tail;
    if (current[head] === undefined) {
      current[head] = {};
    }
    current = current[head];
  }
  current[path[0]] = value;
  return obj;
};

const InvoicesContainer = props => {
  const [filters, setFilters] = useState({
    invoiceStatus: [],
    transactionStatus: [],
    journalTitle: [],
    referenceNumber: null,
    customId: null
  });
  const setFilter = filterConfig => {
    let _filters = { ...filters };
    const [[key, value]] = Object.entries(filterConfig);
    const currentCriteria = createPath({}, key, value);

    if ('invoiceStatus' in currentCriteria) {
      const [[status, selected]] = Object.entries(
        currentCriteria.invoiceStatus
      );
      if (selected) {
        _filters['invoiceStatus'].push(status);
      } else {
        _filters['invoiceStatus'].splice(
          _filters['invoiceStatus'].indexOf(status),
          1
        );
      }
    }

    if ('transactionStatus' in currentCriteria) {
      const [[status, selected]] = Object.entries(
        currentCriteria.transactionStatus
      );
      if (selected) {
        _filters['transactionStatus'].push(status);
      } else {
        _filters['transactionStatus'].splice(
          _filters['transactionStatus'].indexOf(status),
          1
        );
      }
    }

    if ('journalTitle' in currentCriteria) {
      const journals = currentCriteria.journalTitle;
      _filters['journalTitle'] = journals.map(j => j.journalId);
    }

    if ('referenceNumber' in currentCriteria) {
      _filters['referenceNumber'] = currentCriteria.referenceNumber;
    }

    if ('customId' in currentCriteria) {
      _filters['customId'] = currentCriteria.customId;
    }

    console.info(_filters);
    setFilters(_filters);
  };

  return (
    <React.Fragment>
      <Container fluid={true}>
        <HeaderMain title='Invoices' className='mb-5 mt-4' />
        <Row>
          <Col lg={3}>
            <InvoicesLeftNav setFilter={setFilter} />
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
            <InvoicesList filters={filters} />
            {/* ) : (
            <ProjectsGrid />
          )} */}
          </Col>
        </Row>
      </Container>
    </React.Fragment>
  );
};

InvoicesContainer.propTypes = {
  match: PropTypes.object.isRequired
};

export default InvoicesContainer;
