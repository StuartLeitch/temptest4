import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'graphql-hooks';
import LoadingOverlay from 'react-loading-overlay';
import format from 'date-fns/format';

import {
  ButtonToolbar,
  Card,
  CardBody,
  CardTitle,
  Col,
  Container,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Row,
  Nav,
  NavItem,
  Spinner,
  TabPane,
  UncontrolledButtonDropdown,
  UncontrolledTabs,
} from '../../../components';

import { HeaderMain } from '../../components/HeaderMain';
import { TimelineMini } from '../../components/Timeline/TimelineMini';

import { INVOICE_QUERY } from '../graphql';
import CreditNoteDetailsTab from './components/CreditNoteDetailsTab';
import ArticleDetailsTab from './components/ArticleDetailsTab';
import PayerDetailsTab from './components/PayerDetailsTab';

const Details: React.FC = () => {
  const { id } = useParams() as any;

  const { loading, error, data } = useQuery(INVOICE_QUERY, {
    variables: {
      id,
    },
  });

  if (loading)
    return (
      <LoadingOverlay
        active={loading}
        spinner={
          <Spinner style={{ width: '12em', height: '12em' }} color='primary' />
        }
      />
    );

  if (error) return <div>Something Bad Happened</div>;

  const { invoice } = data;
  const { status: invoiceStatus, id: invoiceId } = invoice;

  const { coupons, waivers, price } = invoice?.invoiceItem;
  let netCharges = price;

  if (coupons?.length) {
    netCharges -= coupons.reduce(
      (acc, coupon) => acc + (coupon.reduction / 100) * price,
      0
    );
  }
  if (waivers?.length) {
    netCharges -= waivers.reduce(
      (acc, waiver) => acc + (waiver.reduction / 100) * price,
      0
    );
  }
  const vat = (netCharges / 100) * invoice?.invoiceItem?.vat;
  const total = netCharges + vat;

  let statusClassName = 'warning';
  if (invoiceStatus === 'ACTIVE') {
    statusClassName = 'primary';
  }
  if (invoiceStatus === 'FINAL') {
    statusClassName = 'success';
  }

  return (
    <React.Fragment>
      <Container fluid={true}>
        <HeaderMain
          title={`Credit Note #CN-${invoice.referenceNumber}`}
          className='mb-5 mt-4'
        />
        {/* START Header 1 */}
        <Row>
          <Col lg={12}>
            <div className='d-flex mb-3'>
              <ButtonToolbar className='ml-auto'>
                <UncontrolledButtonDropdown className='mr-3'>
                  <DropdownToggle
                    color='link'
                    className='p-0 text-decoration-none'
                  >
                    <i
                      className={`fas fa-circle text-${statusClassName} mr-2`}
                    ></i>
                    {invoiceStatus}
                    <i className='fas fa-angle-down ml-2' />
                  </DropdownToggle>
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
                    invoiceId={invoiceId}
                    invoice={invoice}
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
          <Col lg={4}>
            {/* START Card Widget */}
            <Card className='mb-3'>
              <CardBody>
                <CardTitle tag='h6'>Timeline</CardTitle>
                {invoice?.dateCreated && (
                  <TimelineMini
                    icon='circle'
                    iconClassName='text-success'
                    badgeTitle='Final'
                    badgeColor='success'
                    date={format(
                      new Date(invoice?.dateCreated),
                      'dd MMMM yyyy'
                    )}
                    phrase={'Credit Note enters FINAL state.'}
                  />
                )}
                {/* {invoice?.dateIssued && (
                  <TimelineMini
                    icon='times-circle'
                    iconClassName='text-primary'
                    badgeTitle='Active'
                    badgeColor='primary'
                    date={format(new Date(invoice?.dateIssued), 'dd MMMM yyyy')}
                    phrase={'Credit Note enters ACTIVE state.'}
                  />
                )} */}
                {/* {invoice?.payments?.length > 0 && (
                  <TimelineMini
                    icon='check-circle'
                    iconClassName='text-success'
                    badgeTitle='Paid'
                    badgeColor='success'
                    date={format(
                      invoice?.payments
                        ?.map(i => new Date(i.dateCreated))
                        .sort(compareDesc)[0],
                      'dd MMMM yyyy'
                    )}
                    phrase={'Credit Note enters FINAL state.'}
                  />
                )} */}
                {invoice?.creditNote && (
                  <TimelineMini
                    icon='check-circle'
                    iconClassName='text-warning'
                    badgeTitle='Credit Note'
                    badgeColor='warning'
                    date={format(
                      new Date(invoice?.creditNote?.dateCreated),
                      'dd MMMM yyyy'
                    )}
                    phrase={'Credit Note issued.'}
                  />
                )}
                {invoice?.invoiceItem?.article?.datePublished && (
                  <TimelineMini
                    icon='play-circle'
                    iconClassName='text-blue'
                    badgeTitle='Published'
                    badgeColor='blue'
                    date={format(
                      new Date(invoice?.invoiceItem?.article?.datePublished),
                      'dd MMMM yyyy'
                    )}
                    phrase={'Article enters PUBLISHED state.'}
                  />
                )}
              </CardBody>
            </Card>
            {/* END Card Widget */}
          </Col>
        </Row>
      </Container>
    </React.Fragment>
  );
};

export default Details;
