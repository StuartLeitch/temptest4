import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'graphql-hooks';
import LoadingOverlay from 'react-loading-overlay';

import {
  ButtonToolbar,
  Col,
  Container,
  DropdownMenu,
  DropdownItem,
  Row,
  Nav,
  NavItem,
  Spinner,
  TabPane,
  UncontrolledButtonDropdown,
  UncontrolledTabs,
} from '../../components';

import { HeaderMain } from '../components/HeaderMain'

import { CREDIT_NOTE_QUERY } from './graphql';
import CreditNoteDetailsTab from './components/CreditNoteDetailsTab';
import ArticleDetailsTab from '../Invoice/Details/components/ArticleDetailsTab'
import PayerDetailsTab from '../Invoice/Details/components/PayerDetailsTab';

const Details: React.FC = () => {
  const { id } = useParams() as any;

  const { loading: loadingCreditNoteData, error: creditNoteDataError, data: creditNoteData } = useQuery(CREDIT_NOTE_QUERY, {
    variables: {
      id,
    },
  });
  if (loadingCreditNoteData)
    return (
      <LoadingOverlay
        active={loadingCreditNoteData}
        spinner={
          <Spinner style={{ width: '12em', height: '12em' }} color='primary' />
        }
      />
    );


  if (creditNoteDataError) return <div>Something Bad Happened</div>;
 

 
  const creditNote = creditNoteData?.getCreditNoteById
  const { invoice } = creditNote
        
  let netCharges = invoice?.invoiceItem?.price * -1;
  let vat = creditNote.vat
  
  const total = netCharges + vat;

  return (
    <React.Fragment>
      <Container fluid={true}>
        <HeaderMain
          title={`Credit Note #${creditNote.persistentReferenceNumber ?? '---'}`}
          className='mb-5 mt-4'
        />
        {/* START Header 1 */}
        <Row>
          <Col lg={12}>
            <div className='d-flex mb-3'>
              <ButtonToolbar className='ml-auto'>
                <UncontrolledButtonDropdown className='mr-3'>
                  <DropdownMenu right>
                    <DropdownItem header>Select Status</DropdownItem>
                    <DropdownItem>
                      <i className='fas fa-circle text-warning mr-2'></i>
                      Draft
                    </DropdownItem>
                    <DropdownItem>
                      <i className='fas fa-circle text-primary mr-2'></i>
                      Active
                    </DropdownItem>
                    <DropdownItem active>
                      <i className='fas fa-circle text-success mr-2'></i>
                      Final
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledButtonDropdown>
              </ButtonToolbar>
            </div>
          </Col>
        </Row>
        <Row>
          <Col lg={8}>
            <UncontrolledTabs initialActiveTabId='creditNote'>
              {/* START Pills Nav */}
              <Nav tabs className='flex-column flex-md-row mt-4 mt-lg-0'>
                <NavItem>
                  <UncontrolledTabs.NavLink tabId='creditNote'>
                    Credit Note Details
                  </UncontrolledTabs.NavLink>
                </NavItem>
                <NavItem>
                  <UncontrolledTabs.NavLink tabId='article'>
                    Article Details
                  </UncontrolledTabs.NavLink>
                </NavItem>
                <NavItem>
                  <UncontrolledTabs.NavLink tabId='payer'>
                    Payer Details
                  </UncontrolledTabs.NavLink>
                </NavItem>
              </Nav>
              {/* END Pills Nav */}
              <UncontrolledTabs.TabContent>
                <TabPane tabId='creditNote'>
                  <CreditNoteDetailsTab
                    invoiceId={creditNote.invoiceId}
                    invoice={invoice}
                    creditNote={creditNote}
                    netCharges={netCharges}
                    vat={vat}
                    total={total}
                  />
                </TabPane>
                <TabPane tabId='article'>
                  <ArticleDetailsTab invoice={invoice} />
                </TabPane>
                <TabPane tabId='payer'>
                  <PayerDetailsTab invoice={invoice} />
                </TabPane>
              </UncontrolledTabs.TabContent>
            </UncontrolledTabs>
          </Col>
        </Row>
      </Container>
    </React.Fragment>
  );
};

export default Details;
