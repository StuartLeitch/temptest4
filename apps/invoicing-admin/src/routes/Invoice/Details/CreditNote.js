import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from 'graphql-hooks';
import LoadingOverlay from 'react-loading-overlay';
import DatePicker from 'react-datepicker';
import format from 'date-fns/format';
import numeral from 'numeral';

import {
  Accordion,
  Badge,
  Button,
  // ButtonDropdown,
  // ButtonGroup,
  ButtonToolbar,
  Card,
  CardBody,
  // CardGroup,
  // CardText,
  CardTitle,
  Col,
  // CardHeader,
  // CardFooter,
  Container,
  // CustomInput,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  ModalDropdown,
  // FormFeedback,
  Form,
  FormGroup,
  Media,
  Label,
  Input,
  InputGroup,
  InputGroupAddon,
  Row,
  // FormText,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Nav,
  NavItem,
  Spinner,
  Table,
  TabPane,
  UncontrolledButtonDropdown,
  UncontrolledModal,
  UncontrolledTabs,
} from './../../../components';

import { HeaderMain } from '../../components/HeaderMain';
import { ButtonInput } from '../../Forms/DatePicker/components/ButtonInput';
import { TimelineMini } from '../../components/Timeline/TimelineMini';
import { DlRowArticleDetails } from '../../components/Invoice/DlRowArticleDetails';
import { DlRowPayerDetails } from '../../components/Invoice/DlRowPayerDetails';

import { INVOICE_QUERY } from '../graphql';

const Details = () => {
  const { id } = useParams();

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
                  <Card body className='border-top-0'>
                    <CardBody>
                      <CardTitle tag='h6' className='mb-4'>
                        Credit Note: Details
                        <span className='small ml-1 text-muted'>
                          #{invoiceId}
                        </span>
                      </CardTitle>
                      {/* START Form */}
                      <Form
                        style={{
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          flexDirection: 'row',
                          display: 'flex',
                        }}
                      >
                        <div style={{ flex: 1 }} className='mr-2'>
                          {/* START Input */}
                          <FormGroup row>
                            <Label sm={5}>Credit Note Issue Date</Label>
                            <Col sm={7}>
                              <DatePicker
                                customInput={<ButtonInput />}
                                selected={new Date(invoice.dateIssued)}
                                onChange={() => {}}
                              />
                            </Col>
                          </FormGroup>
                          {/* END Input */}
                          <FormGroup row>
                            <Label for='staticText' sm={5}>
                              Ref. Number
                            </Label>
                            <Col sm={7}>
                              <Input
                                plaintext
                                readOnly
                                value={`CN-${invoice.referenceNumber}`}
                              />
                            </Col>
                          </FormGroup>
                          {invoice.cancelledInvoiceReference && (
                            <FormGroup row>
                              <Label for='staticText' sm={12}>
                                Cancelled Invoice
                                <Link
                                  to={`/invoices/details/${invoice.cancelledInvoiceReference}`}
                                >
                                  {
                                    <span className='ml-1 font-weight-bold text-warning'>
                                      Cancelled Invoice #
                                      {invoice.cancelledInvoiceReference}
                                    </span>
                                  }
                                </Link>
                              </Label>
                            </FormGroup>
                          )}
                        </div>
                      </Form>
                      {/* END Form */}

                      <CardTitle tag='h6' className='mt-5 mb-4'>
                        Credit Note: Charges
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
                              <span>
                                {numeral(invoice?.invoiceItem?.price).format(
                                  '$0.00'
                                )}
                              </span>
                            </td>
                            <td
                              colSpan='2'
                              className='align-middle text-right text-dark font-weight-bold'
                            >
                              {numeral(invoice?.invoiceItem?.price).format(
                                '$0.00'
                              )}
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
                              {numeral(invoice?.invoiceItem?.price).format(
                                '$0.00'
                              )}
                            </td>
                          </tr>
                          {invoice?.invoiceItem?.coupons?.length > 0 &&
                            invoice.invoiceItem.coupons.map((coupon) => (
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
                                  &ndash;
                                  {numeral(
                                    (invoice.invoiceItem.price *
                                      coupon.reduction) /
                                      100
                                  ).format('$0.00')}
                                </td>
                              </tr>
                            ))}
                          {invoice?.invoiceItem?.waivers?.length > 0 &&
                            invoice.invoiceItem.waivers.map((waiver) => (
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
                              {numeral(netCharges).format('$0.00')}
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
                              {numeral(vat.toFixed(2)).format('$0.00')}
                            </td>
                          </tr>
                          <tr>
                            <td colSpan='3' style={{ borderTop: 'none' }}></td>
                            <td className='align-middle h4 text-uppercase text-dark font-weight-bold'>
                              Total
                            </td>
                            {/* <td>Really?</td> */}
                            <td className='align-middle text-right h2 text-uppercase text-success font-weight-bold'>
                              {numeral(total.toFixed(2)).format('$0.00')}
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                      <CardTitle tag='h6' className='mt-5 mb-4'>
                        Credit Note: Payments
                        {/* <span className='small ml-1 text-muted'>
                          #{invoice?.payment?.paymentMethod?.id}
                        </span> */}
                      </CardTitle>
                      {invoice?.payments?.length === 0 && (
                        <span className='medium text-muted'>
                          No payments processed yet.
                        </span>
                      )}
                      {invoice?.payments?.length > 0 &&
                        invoice?.payments?.map((payment) => {
                          const paymentMethod = payment?.paymentMethod?.name;
                          let paymentMethodClassName = '';
                          switch (paymentMethod) {
                            case 'Credit Card':
                              paymentMethodClassName = 'fas fa-credit-card';
                              break;
                            case 'Bank Transfer':
                              paymentMethodClassName = 'fas fa-landmark';
                              break;
                            default:
                              paymentMethodClassName = 'fab fa-paypal';
                          }

                          return (
                            <React.Fragment key={payment.id}>
                              <h6 className='my-3'>
                                <i
                                  className={`fa-fw text-primary mr-2 ${paymentMethodClassName}`}
                                ></i>
                                {` ${paymentMethod}`}
                                <span className='small ml-1 text-muted'>
                                  payment method
                                </span>
                              </h6>
                              <Row tag='dl'>
                                <dt className='col-sm-4'>Payer</dt>
                                <dd className='col-sm-8 text-inverse'>
                                  <samp>
                                    {invoice?.payer?.name} (
                                    <a href='#'>{invoice?.payer?.email}</a>)
                                  </samp>
                                </dd>

                                <dt className='col-sm-4'>Paid Date</dt>
                                <dd className='col-sm-8 text-inverse'>
                                  {format(
                                    new Date(payment?.datePaid),
                                    'dd MMMM yyyy'
                                  )}
                                </dd>
                                <dt className='col-sm-4'>Amount</dt>
                                <dd className='col-sm-8 text-inverse'>
                                  {' '}
                                  $ {payment?.amount.toFixed(2)}
                                </dd>
                                <dt className='col-sm-4'>External Reference</dt>
                                <dd className='col-sm-8 text-success'>
                                  {payment?.foreignPaymentId}
                                </dd>
                              </Row>
                            </React.Fragment>
                          );
                        })}
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
