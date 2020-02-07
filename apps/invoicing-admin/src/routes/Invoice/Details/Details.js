import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'graphql-hooks';
import LoadingOverlay from 'react-loading-overlay';
import DatePicker, { setDefaultLocale } from 'react-datepicker';
import format from 'date-fns/format';
import subWeeks from 'date-fns/subWeeks';

import {
  Accordion,
  Badge,
  Button,
  ButtonGroup,
  ButtonToolbar,
  Card,
  CardBody,
  CardGroup,
  CardText,
  CardTitle,
  Col,
  CardHeader,
  CardFooter,
  Container,
  CustomInput,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  FormFeedback,
  Form,
  FormGroup,
  Label,
  Input,
  Row,
  FormText,
  Nav,
  NavItem,
  Spinner,
  Table,
  TabPane,
  UncontrolledButtonDropdown,
  UncontrolledTabs
} from './../../../components';
import { HeaderMain } from '../../components/HeaderMain';
import { HeaderDemo } from '../../components/HeaderDemo';
import { ButtonInput } from '../../Forms/DatePicker/components/ButtonInput';
import { TimelineMini } from '../../components/Timeline/TimelineMini';
// import { CardTextDemo } from '../../components/CardTextDemo';
import { TimelineDefault } from '../../components/Timeline/TimelineDefault';
import { DlRowContacts } from '../../components/Profile/DlRowContacts';
import { DlRowAddress } from '../../components/Profile/DlRowAddress';
import { TrTableMessages } from '../../Apps/ProfileDetails/components/TrTableMessages';
import { DlRowArticleDetails } from '../../components/Invoice/DlRowArticleDetails';
import { DlRowPayerDetails } from '../../components/Invoice/DlRowPayerDetails';
import { Coupon } from '../../components/Invoice/Coupon';

const INVOICE_QUERY = `
query invoice($id: String) {
  invoice(invoiceId: $id) {
    ...invoiceFragment
  }
}
fragment invoiceFragment on Invoice {
  id: invoiceId
  status
  dateCreated
  dateIssued
  dateAccepted
  referenceNumber
  payer {
    ...payerFragment
  }
  payment {
    ...paymentFragment
  }
  invoiceItem {
    id
    price
    type
    rate
    vat
    vatnote
    dateCreated
    coupons {
      ...couponFragment
    }
    waivers {
      ...waiverFragment
    }
    article {
      ...articleFragment
    }
  }
}
fragment payerFragment on Payer {
  id
  type
  name
  email
  vatId
  organization
  address {
    ...addressFragment
  }
}
fragment paymentFragment on Payment {
  id
  foreignPaymentId
  amount
  paymentMethod {
    ...paymentMethodFragment
  }
}
fragment paymentMethodFragment on PaymentMethod {
  id
  name
}
fragment addressFragment on Address {
  city
  country
  state
  postalCode
  addressLine1
}
fragment couponFragment on Coupon {
  code
  reduction
}
fragment waiverFragment on Waiver {
  reduction
  type_id
}
fragment articleFragment on Article {
  id
  title
  created
  articleType
  authorCountry
  authorEmail
  customId
  journalTitle
  authorSurname
  authorFirstName
  journalTitle
}
`;

const Details = () => {
  let { id } = useParams();
  const { loading, error, data } = useQuery(INVOICE_QUERY, {
    variables: {
      id
    }
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
  console.info(invoice);
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
  if (invoice.status === 'ACTIVE') {
    statusClassName = 'primary';
  }
  if (invoice.status === 'FINAL') {
    statusClassName = 'success';
  }

  return (
    <React.Fragment>
      <Container fluid={true}>
        <HeaderMain
          title={`Invoice #${invoice.referenceNumber}`}
          className='mb-5 mt-4'
        />
        {/* START Header 1 */}
        <Row>
          <Col lg={12}>
            <div className='d-flex mb-3'>
              {/* <CardTitle tag='h6'>Button Right Toolbar</CardTitle> */}
              <ButtonToolbar className='ml-auto'>
                <UncontrolledButtonDropdown className='mr-3'>
                  <DropdownToggle
                    color='link'
                    className='p-0 text-decoration-none'
                  >
                    <i
                      className={`fas fa-circle text-${statusClassName} mr-2`}
                    ></i>
                    {invoice.status}
                    <i className='fas fa-angle-down ml-2' />
                  </DropdownToggle>
                  <DropdownMenu right>
                    <DropdownItem header>Select Status</DropdownItem>
                    {/* <DropdownItem>
                    <i className='fas fa-circle text-danger mr-2'></i>
                    Big
                  </DropdownItem> */}
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
                <Button color='primary' className='mr-2'>
                  Add Payment
                </Button>
                <Button color='secondary' className='mr-2' outline>
                  Split Payment
                </Button>
                <Button color='primary' outline>
                  Apply Coupon
                </Button>
              </ButtonToolbar>
            </div>
          </Col>
        </Row>
        {/* <Row>
        <Col lg={12}>
          <HeaderDemo
            no={1}
            title='Invoice Details'
            subTitle='Basic button layout options'
          />
        </Col>
      </Row> */}
        <Row>
          <Col lg={8}>
            <UncontrolledTabs initialActiveTabId='invoice'>
              {/* START Pills Nav */}
              <Nav tabs className='flex-column flex-md-row mt-4 mt-lg-0'>
                <NavItem>
                  <UncontrolledTabs.NavLink tabId='invoice'>
                    Invoice Details
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
                <TabPane tabId='invoice'>
                  <Card body className='border-top-0'>
                    <CardBody>
                      <CardTitle tag='h6' className='mb-4'>
                        Invoice: Details
                        <span className='small ml-1 text-muted'>
                          #{invoice.id}
                        </span>
                      </CardTitle>
                      {/* START Form */}
                      <Form>
                        {/* START Input */}
                        <FormGroup row>
                          <Label sm={3}>Invoice Issue Date</Label>
                          <DatePicker
                            customInput={<ButtonInput />}
                            selected={new Date(invoice.dateIssued)}
                            onChange={() => {}}
                          />
                        </FormGroup>
                        {/* END Input */}
                        <FormGroup row>
                          <Label sm={3}>Date of Supply</Label>
                          <DatePicker
                            readOnly
                            customInput={<ButtonInput />}
                            selected={Date.now()}
                          />
                        </FormGroup>
                        <FormGroup row>
                          <Label for='staticText' sm={3}>
                            Reference Number
                          </Label>
                          <Col sm={9}>
                            <Input
                              plaintext
                              readOnly
                              value={invoice.referenceNumber}
                            />
                          </Col>
                        </FormGroup>
                        <FormGroup row>
                          <Label for='staticText' sm={3}>
                            Terms
                          </Label>
                          <Col sm={9}>
                            <Input
                              readOnly
                              plaintext
                              value='Payable upon Receipt'
                            />
                          </Col>
                        </FormGroup>
                      </Form>
                      {/* END Form */}

                      <CardTitle tag='h6' className='mt-5 mb-4'>
                        Invoice: Charges
                        {/* <span className='small ml-1 text-muted'>#02</span> */}
                      </CardTitle>
                      <Table className='mb-0' responsive>
                        <thead className='thead-light'>
                          <tr>
                            <th className='bt-1'>Item</th>
                            <th className='bt-1 w-25'></th>
                            <th className='text-right bt-1'>Price</th>
                            <th className='bt-1'></th>
                            <th className='text-right bt-1'>Totals</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className='align-middle'>
                              <span>{invoice?.invoiceItem?.type}</span>
                            </td>
                            <td colSpan='2' className='align-middle text-right'>
                              <span>${invoice?.invoiceItem?.price}</span>
                            </td>
                            <td
                              colSpan='2'
                              className='align-middle text-right text-dark font-weight-bold'
                            >
                              ${invoice?.invoiceItem?.price}
                            </td>
                          </tr>
                          <tr>
                            <td colSpan='3'></td>
                            <td className='align-middle'>
                              <span className='text-uppercase text-muted font-weight-bold'>
                                Sub&ndash;Total
                              </span>
                            </td>
                            <td className='align-middle text-right text-dark font-weight-bold'>
                              ${invoice?.invoiceItem?.price}
                            </td>
                          </tr>
                          {invoice?.invoiceItem?.coupons?.length > 0 &&
                            invoice.invoiceItem.coupons.map(coupon => (
                              <tr>
                                <td
                                  colSpan='2'
                                  style={{ borderTop: 'none' }}
                                ></td>
                                <td
                                  className='align-middle text-right'
                                  style={{ borderTop: 'none' }}
                                >
                                  <Badge pill color='success'>
                                    coupon
                                  </Badge>
                                </td>
                                <td>
                                  <span className='small mt-2'>
                                    {coupon.code}
                                  </span>
                                  <span className='text-muted px-2'>
                                    (&ndash;{coupon.reduction}%)
                                  </span>
                                </td>
                                <td className='align-middle text-right text-dark font-weight-bold'>
                                  &ndash;$0.15
                                </td>
                              </tr>
                            ))}
                          {invoice?.invoiceItem?.waivers?.length > 0 &&
                            invoice.invoiceItem.waivers.map(waiver => (
                              <tr>
                                <td
                                  colSpan='2'
                                  style={{ borderTop: 'none' }}
                                ></td>
                                <td
                                  className='align-middle text-right'
                                  style={{ borderTop: 'none' }}
                                >
                                  <Badge pill color='success'>
                                    waiver
                                  </Badge>
                                </td>
                                <td>
                                  <span className='small mt-2'>
                                    {waiver.type_id}
                                  </span>
                                  <span className='text-muted px-2'>
                                    (&ndash;{waiver.reduction}%)
                                  </span>
                                </td>
                                <td className='align-middle text-right text-dark font-weight-bold'>
                                  &ndash;$
                                  {(waiver.reduction / 100) *
                                    invoice.invoiceItem.price}
                                </td>
                              </tr>
                            ))}
                          <tr>
                            <td colSpan='3' style={{ borderTop: 'none' }}></td>
                            <td className='align-middle text-uppercase text-muted font-weight-bold'>
                              Net Charges
                            </td>
                            {/* <td>Really?</td> */}
                            <td className='align-middle text-right text-dark font-weight-bold'>
                              ${netCharges}
                            </td>
                          </tr>
                          <tr>
                            <td colSpan='3' style={{ borderTop: 'none' }}></td>
                            <td className='align-middle'>
                              <span className='text-uppercase text-muted font-weight-bold'>
                                VAT
                              </span>
                              <span className='text-muted px-2'>
                                (+{invoice?.invoiceItem?.vat}%)
                              </span>
                            </td>
                            {/* <td>Really?</td> */}
                            <td className='align-middle text-right text-dark font-weight-bold'>
                              ${vat.toFixed(2)}
                            </td>
                          </tr>
                          <tr>
                            <td colSpan='3' style={{ borderTop: 'none' }}></td>
                            <td className='align-middle h4 text-uppercase text-dark font-weight-bold'>
                              Total
                            </td>
                            {/* <td>Really?</td> */}
                            <td className='align-middle text-right h2 text-uppercase text-success font-weight-bold'>
                              ${total.toFixed(2)}
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                      <CardTitle tag='h6' className='mt-5 mb-4'>
                        Invoice: Payment Method
                        <span className='small ml-1 text-muted'>
                          #{invoice?.payment?.paymentMethod?.id}
                        </span>
                      </CardTitle>
                      <div className='mb-2'>
                        <i
                          className={`fa-fw ${
                            invoice?.payment?.paymentMethod?.name ===
                            'Credit Card'
                              ? 'fas fa-credit-card'
                              : 'fab fa-paypal'
                          } text-primary mr-2`}
                        ></i>
                        <span className='text-inverse'>
                          {invoice?.payment?.paymentMethod?.name}
                        </span>{' '}
                        - Payer:{' '}
                        <samp>
                          {invoice?.payer?.name} (
                          <a href='#'>{invoice?.payer?.email}</a>)
                        </samp>
                      </div>
                      <dl className='row'>
                        <dt className='col-sm-4 text-right'>Amount</dt>
                        <dd className='col-sm-8 text-inverse'>
                          $ {invoice?.payment?.amount.toFixed(2)}
                        </dd>
                        <dt className='col-sm-4 text-right'>
                          Foreign Payment ID
                        </dt>
                        <dd className='col-sm-8 text-success'>
                          {invoice?.payment?.foreignPaymentId}
                        </dd>
                      </dl>
                    </CardBody>
                  </Card>
                </TabPane>
                <TabPane tabId='article'>
                  <Card body className='border-top-0'>
                    <CardBody>
                      <CardTitle tag='h6' className='mb-4'>
                        Article: Details
                        <span className='small ml-1 text-muted'>
                          #{invoice?.invoiceItem?.article?.id}
                        </span>
                      </CardTitle>
                      <DlRowArticleDetails
                        {...invoice?.invoiceItem?.article}
                        leftSideClassName='text-lg-right'
                        rightSideClassName='text-inverse'
                      />
                    </CardBody>
                  </Card>
                </TabPane>
                <TabPane tabId='payer'>
                  <Card body className='border-top-0'>
                    <CardBody>
                      <CardTitle tag='h6' className='mb-4'>
                        Payer: Details
                        <span className='small ml-1 text-muted'>
                          #{invoice?.payer?.id}
                        </span>
                      </CardTitle>
                      <div className='mt-4 mb-2'>
                        <span className='small'>Contact</span>
                      </div>
                      <DlRowPayerDetails
                        {...invoice?.payer}
                        leftSideClassName='text-lg-right'
                        rightSideClassName='text-inverse'
                      />
                      <div className='mt-4 mb-2'>
                        <span className='small'>Address</span>
                      </div>
                      <dl className='row'>
                        {' '}
                        <dt className={`col-sm-3 text-lg-right`}>
                          Address Line 1
                        </dt>
                        <dd className={`col-sm-9 text-inverse`}>
                          {invoice?.payer?.address?.addressLine1}
                        </dd>
                        <dt className={`col-sm-3 text-lg-right`}>City</dt>
                        <dd className={`col-sm-9 text-inverse`}>
                          {invoice?.payer?.address?.city}
                        </dd>
                        <dt className={`col-sm-3 text-lg-right`}>Country</dt>
                        <dd className={`col-sm-9 text-inverse`}>
                          {invoice?.payer?.address?.country}
                        </dd>
                        <dt className={`col-sm-3 text-lg-right`}>State</dt>
                        <dd className={`col-sm-9 text-inverse`}>
                          {invoice?.payer?.address?.state}
                        </dd>
                        <dt className={`col-sm-3 text-lg-right`}>
                          Postal Code
                        </dt>
                        <dd className={`col-sm-9 text-inverse`}>
                          {invoice?.payer?.address?.postalCode}
                        </dd>
                      </dl>
                    </CardBody>
                  </Card>
                </TabPane>
              </UncontrolledTabs.TabContent>
            </UncontrolledTabs>
          </Col>
          <Col lg={4}>
            {/* START Card Widget */}
            <Card className='mb-3'>
              <CardBody>
                <CardTitle tag='h6'>Timeline</CardTitle>
                <TimelineMini
                  icon='circle'
                  badgeTitle='Draft'
                  badgeColor='secondary'
                  date={format(subWeeks(new Date(), 3), 'dd MMMM yyyy')}
                  phrase={'Invoice enters DRAFT state.'}
                />
                <TimelineMini
                  icon='times-circle'
                  iconClassName='text-primary'
                  badgeTitle='Active'
                  badgeColor='primary'
                  date={format(subWeeks(new Date(), 2), 'dd MMMM yyyy')}
                  phrase={'Invoice enters ACTIVE state.'}
                />
                <TimelineMini
                  icon='check-circle'
                  iconClassName='text-success'
                  badgeTitle='Paid'
                  badgeColor='success'
                  date={format(subWeeks(new Date(), 1), 'dd MMMM yyyy')}
                  phrase={'Invoice enters FINAL state.'}
                />
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
