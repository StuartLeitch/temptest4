import React from 'react';
import { Link } from 'react-router-dom';
import numeral from 'numeral';
import parseISO from 'date-fns/parseISO';
import format from 'date-fns/format';
import addMinutes from 'date-fns/addMinutes';
import DatePicker from 'react-datepicker';
import { ButtonInput } from '../../../Forms/DatePicker/components/ButtonInput';
import { Invoice } from '../types';
import {
  Badge,
  Card,
  CardBody,
  CardTitle,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  Row,
  Table,
} from '../../../../components';

import Config from '../../../../config';

const InvoiceDetailsTab: React.FC<InvoiceDetailsTabProps> = ({
  invoiceId,
  invoice,
  netCharges,
  vatAmount,
  totalCharges,
}) => {
  const invoiceDetails = () => (
    <>
      <CardTitle tag='h6' className='d-flex'>
        Invoice: Details
        <a
          target='_blank'
          rel='noopener noreferrer'
          href={`${Config.feRoot}/payment-details/${invoiceId}`}
          className='ml-auto'
        >
          {
            <span className='font-weight-normal text-underlined text-blue'>
              <u>#{invoiceId}</u>
            </span>
          }
        </a>
      </CardTitle>
      <Form
        style={{
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexDirection: 'row',
          display: 'flex',
        }}
      >
        <div style={{ flex: 1 }} className='mr-2'>
          <FormGroup row>
            <Label sm={5}>Invoice Issue Date</Label>
            <Col sm={7}>
              {invoice.dateIssued ? (
                <DatePicker
                  disabled
                  customInput={<ButtonInput />}
                  selected={new Date(Date.parse(formatDate(new Date(invoice?.dateIssued))))}
                  onChange={() => ({})}
                />
              ) : (
                <Input readOnly plaintext value='---' />
              )}
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label sm={5}>Date of Supply</Label>
            <Col sm={7}>
              <DatePicker
                readOnly
                customInput={<ButtonInput />}
                selected={Date.now()}
              />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label for='staticText' sm={5}>
              Terms
            </Label>
            <Col sm={7}>
              <Input readOnly plaintext value='Payable upon Receipt' />
            </Col>
          </FormGroup>
          {invoice.creditNote && (
            <FormGroup row>
              <Label for='staticText' sm={12}>
                Credit Note
                <Link
                  to={`/credit-notes/details/${invoice.creditNote.invoiceId}`}
                >
                  {
                    <span className='ml-1 font-weight-bold text-warning'>
                     {invoice.creditNote.referenceNumber}
                    </span>
                  }
                </Link>
              </Label>
            </FormGroup>
          )}
        </div>
        <div style={{ flex: 1 }} className='ml-2'>
          <FormGroup row>
            <Label for='staticText' sm={5}>
              Ref. Number
            </Label>
            <Col sm={7}>
              <Input plaintext readOnly value={invoice.referenceNumber} />
            </Col>
          </FormGroup>
        </div>
      </Form>
    </>
  );

  const invoiceCharges = () => (
    <>
      <CardTitle tag='h6' className='mt-5 mb-4'>
        Invoice: Charges
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
            <td colSpan={2} className='align-middle text-right'>
              <span>${invoice?.invoiceItem?.price}</span>
            </td>
            <td
              colSpan={2}
              className='align-middle text-right text-dark font-weight-bold'
            >
              ${invoice?.invoiceItem?.price}
            </td>
          </tr>
          <tr>
            <td colSpan={3}></td>
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
            invoice.invoiceItem.coupons.map((coupon, index) => (
              <tr key={index}>
                <td colSpan={2} style={{ borderTop: 'none' }}></td>
                <td
                  className='align-middle text-right'
                  style={{ borderTop: 'none' }}
                >
                  <Badge pill color='success'>
                    coupon
                  </Badge>
                </td>
                <td>
                  <span className='small mt-2'>{coupon.code}</span>
                  <span className='text-muted px-2'>
                    (&ndash;{coupon.reduction}%)
                  </span>
                </td>
                <td className='align-middle text-right text-dark font-weight-bold'>
                  &ndash;
                  {numeral(
                    (invoice.invoiceItem.price * coupon.reduction) / 100
                  ).format('$0.00')}
                </td>
              </tr>
            ))}
          {invoice?.invoiceItem?.waivers?.length > 0 &&
            invoice.invoiceItem.waivers.map((waiver) => (
              <tr>
                <td colSpan={2} style={{ borderTop: 'none' }}></td>
                <td
                  className='align-middle text-right'
                  style={{ borderTop: 'none' }}
                >
                  <Badge pill color='success'>
                    waiver
                  </Badge>
                </td>
                <td>
                  <span className='small mt-2'>{waiver.type_id}</span>
                  <span className='text-muted px-2'>
                    (&ndash;{waiver.reduction}%)
                  </span>
                </td>
                <td className='align-middle text-right text-dark font-weight-bold'>
                  {numeral(
                    (waiver.reduction / 100) * invoice.invoiceItem.price * -1
                  ).format('$0.00')}
                </td>
              </tr>
            ))}
          <tr>
            <td colSpan={3} style={{ borderTop: 'none' }}></td>
            <td className='align-middle text-uppercase text-muted font-weight-bold'>
              Net Charges
            </td>
            <td className='align-middle text-right text-dark font-weight-bold'>
              {numeral(netCharges).format('$0.00')}
            </td>
          </tr>
          <tr>
            <td colSpan={3} style={{ borderTop: 'none' }}></td>
            <td className='align-middle'>
              <span className='text-uppercase text-muted font-weight-bold'>
                VAT
              </span>
              <span className='text-muted px-2'>
                (+{invoice?.invoiceItem?.vat}%)
              </span>
            </td>
            <td className='align-middle text-right text-dark font-weight-bold'>
              {numeral(vatAmount.toFixed(2)).format('$0.00')}
            </td>
          </tr>
          <tr>
            <td colSpan={3} style={{ borderTop: 'none' }}></td>
            <td className='align-middle h4 text-uppercase text-dark font-weight-bold'>
              Total
            </td>
            <td className='align-middle text-right h2 text-uppercase text-success font-weight-bold'>
              {numeral(totalCharges.toFixed(2)).format('$0.00')}
            </td>
          </tr>
        </tbody>
      </Table>
    </>
  );

  const paymentStatusColor = (status: string) => {
    if (status === 'PENDING') return 'info';
    if (status === 'COMPLETED') return 'success';
    if (status === 'FAILED') return 'danger';
    if (status === 'CREATED') return 'secondary';
    return '';
  };

  const invoicePayments = () => (
    <>
      <CardTitle tag='h6' className='mt-5 mb-4'>
        Invoice: Payments
      </CardTitle>
      {invoice?.payments?.length === 0 && (
        <span className='medium text-muted'>No payments processed yet.</span>
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
                <span className='small ml-1 text-muted'>payment method</span>
              </h6>
              <Row tag='dl'>
                <dt className='col-sm-4'>Status</dt>
                <dd className='col-sm-8'>
                  <h5>
                    <Badge pill color={paymentStatusColor(payment?.status)}>
                      {payment?.status}
                    </Badge>
                  </h5>
                </dd>

                <dt className='col-sm-4'>Payer</dt>
                <dd className='col-sm-8 text-inverse'>
                  <samp>
                    {invoice?.payer?.name} (
                    <a href={`mailto:${invoice?.payer?.email}`}>
                      {invoice?.payer?.email}
                    </a>
                    )
                  </samp>
                </dd>

                <dt className='col-sm-4'>Paid Date</dt>
                <dd className='col-sm-8 text-inverse'>
                  {formatDate(new Date(payment?.datePaid))}
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
    </>
  );

  return (
    <Card body className='border-top-0'>
      <CardBody>
        {invoiceDetails()}
        {invoiceCharges()}
        {invoicePayments()}
      </CardBody>
    </Card>
  );
};

function formatDate(date) {
  return format(addMinutes(date, date.getTimezoneOffset()), 'dd MMM yyyy');
}

interface InvoiceDetailsTabProps {
  invoiceId: string;
  invoice: Invoice;
  netCharges: number;
  vatAmount: number;
  totalCharges: number;
}

export default InvoiceDetailsTab;
