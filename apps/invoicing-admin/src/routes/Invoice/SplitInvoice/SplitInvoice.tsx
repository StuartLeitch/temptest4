import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from 'graphql-hooks';
import LoadingOverlay from 'react-loading-overlay';
import {
  Button,
  Col,
  Container,
  Row,
  Spinner,
  Form,
  Card,
  CardBody,
  CardTitle
} from './../../../components';
import { HeaderMain } from '../../components/HeaderMain';
import PayerInfo from './components/PayerInfo';
import { INVOICE_QUERY } from '../graphql';

const SplitInvoice: React.FC = () => {

  const [payers, setPayers] = useState({});
  const [invoiceValue, setInvoiceValue] = useState(0);
  const [isTotalAmountReached, setIsTotalAmountReached] = useState(true);
  const [isFormValid, setIsFormValid] = useState(true);
  const [payerId, setPayerId] = useState(0);

  const { id } = useParams();

  const { loading, error, data } = useQuery(
    INVOICE_QUERY,
    {
      variables: {
        id,
      },
    }
  );

  useEffect(() => {
    if (data) {
      const { authorFirstName, authorSurname, authorEmail } = data.invoice.invoiceItem.article;
      const fullName = `${authorFirstName} ${authorSurname}`;

      const totalCharges = getTotalCharges();

      setInvoiceValue(totalCharges);
      setPayers({...payers,
        [payerId]: { fullName, email: authorEmail, amountToPay: totalCharges.toString() }
      });
      setPayerId(payerId + 1);
    }
  }, [data]);

  const getTotalCharges = () => {
    const { vat, coupons, waivers, price } = data.invoice?.invoiceItem;
    const reductions = [...coupons, ...waivers];

    let totalDiscountFromReductions = reductions.reduce(
      (acc, curr) => acc + curr.reduction,
      0
    );
    totalDiscountFromReductions =
      totalDiscountFromReductions > 100 ? 100 : totalDiscountFromReductions;
    const netCharges = price - (price * totalDiscountFromReductions) / 100;
    const vatAmount = (netCharges * vat) / 100;

    return netCharges + vatAmount;
  };

  const splitInvoice = () => {
    // TODO: split invoice
    console.log(payers);
  };

  const splitEqually = () => {
    const individualAmount = (invoiceValue / Object.values(payers).length).toFixed(2);

    const newPayers = {...payers};
    Object.values(newPayers).map((payer: Payer) => payer.amountToPay = individualAmount);

    setPayers(newPayers);
    validateForm(newPayers);
  };

  const addPayer = () => {
    setPayers({...payers, [payerId]: {
      fullName: '',
      email: '',
      amountToPay: ''
    }});
    setIsFormValid(false);
    setPayerId(payerId + 1);
  };

  const removePayer = key => {
    const newPayers = {...payers};
    delete newPayers[key];

    setPayers(newPayers);
    validateForm(newPayers);
  };

  const update = (key: string, field: string, value: string) => {
    const newPayers = {...payers};

    newPayers[key] = {...payers[key], [field]: value};

    setPayers(newPayers);
    validateForm(newPayers);
  };

  const isInsertedAmountValid = (amount) => {
    const validation = /^(([1-9][0-9]*(\.[0-9]{1,2})?))$/;
    return validation.test(amount) && amount <= invoiceValue;
  }

  const hasEmptyFields = ({ fullName, email, amountToPay }) => !fullName || !email || !amountToPay

  const validateForm = payers => {
    const totalInsertedAmount = Object.values(payers as Payers).reduce(
      (acc: number, payer: Payer) => acc + parseFloat(payer.amountToPay || '0'), 0
    );

    console.log(totalInsertedAmount, invoiceValue)

    if (Math.round(totalInsertedAmount) !== invoiceValue) {
      setIsFormValid(false);
      setIsTotalAmountReached(false);
    } else {
      setIsTotalAmountReached(true);
      Object.values(payers).forEach((payer: Payer) => {
        if (hasEmptyFields(payer) || !isInsertedAmountValid(payer.amountToPay)) {
          setIsFormValid(false);
        }
         else {
          setIsFormValid(true);
        }
      });
    }
  };

  if (loading)
    return (
      <LoadingOverlay
        active={loading}
        spinner={
          <Spinner style={{ width: '12em', height: '12em' }} color='primary' />
        }
      />
  );

  if (error)
    return <div>Something Bad Happened</div>;

  return (
    <Container fluid={true}>
      <Link
        to={`/invoices/details/${id}`}
        className='text-decoration-none d-block mb-4 mt-0'
        >
          <i className='fas fa-angle-left mr-2' /> Back to invoice
      </Link>

      <HeaderMain title='Split invoice' className='mb-1 mt-0' />

      <Row className='mb-3'>
        <Col className='align-self-end'>
          Define the payers and amount
        </Col>
        <Col className='text-right'>
          <Button color='secondary' onClick={addPayer}>
            Add Payer
          </Button>
        </Col>
      </Row>

      <Form onSubmit={e => {
        e.preventDefault();
        splitInvoice();
      }}>
        {Object.keys(payers).map((key, index) => {
          return (
            <Card key={key} body className='mb-2'>
              <CardBody className='pt-0'>
                <Row>
                  <Col className='text-right'>
                    <Button color='link' className='p-0' onClick={() => removePayer(key)}>
                      <i className='fas fa-times'></i>
                    </Button>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <CardTitle tag='h6'>
                      Payer #{index + 1}
                    </CardTitle>
                  </Col>
                </Row>
                <Row>
                  <PayerInfo
                    payer={payers[key]}
                    onChange={(field, value) => update(key, field, value)}
                    invoiceValue={invoiceValue}
                  />
                </Row>
              </CardBody>
            </Card>
          )
        })}
        <Col className='mt-3 mb-4'>
          <Row>
           <Button className='mr-3' onClick={() => splitEqually()}>Split Equally</Button>
            <Button disabled={!isFormValid || !isTotalAmountReached} type='submit'>
              Confirm & Send Invoices
            </Button>
          </Row>
          <Row>
            {!isTotalAmountReached &&
              <div className='text-danger'>
                Total amount needs to match invoice value
              </div>
              }
          </Row>
        </Col>
      </Form>
    </Container>
  )
}

interface Payer {
  fullName: string;
  email: string;
  amountToPay: string;
};

interface Payers {
  [key: string]: Payer;
};

export default SplitInvoice;
