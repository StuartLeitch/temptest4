import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { Container, Row, Col } from './../../../components';

import { HeaderMain } from '../../components/HeaderMain';

import InvoicesList from './List';
// import ProjectsGrid from './ProjectsGrid';
import { InvoicesLeftNav } from '../../components/Invoices/InvoicesLeftNav';
// import { InvoicesSmHeader } from '../../components/Invoices/InvoicesSmHeader';

const InvoicesContainer = props => {
  const [filters, setFilters] = useState({
    invoiceStatus: []
  });
  const setFilter = (filterName, filterValue, target) => {
    // console.info(target);

    const _filters = { ...filters };

    const { checked, value } = target;
    // console.info(filterName);
    // console.info(checked);
    // console.info(value);

    if (checked in target) {
      if (checked) {
        if (!(filterName in _filters)) {
          _filters[filterName] = [];
        }
        _filters[filterName].push(filterValue);
      } else {
        _filters[filterName].splice(
          _filters[filterName].indexOf(filterValue),
          1
        );
      }
    }

    if (value) {
      if (!(filterName in _filters)) {
        _filters[filterName] = '';
      }
      _filters[filterName] = value;
    }

    // console.info(_filters);
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
