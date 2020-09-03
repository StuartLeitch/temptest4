import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from 'graphql-hooks';
import numeral from 'numeral';
import { toast } from 'react-toastify';
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
  CardTitle,
} from './../../../components';
import { HeaderMain } from '../../components/HeaderMain';
import PayerInfo from './components/PayerInfo';
import { INVOICE_QUERY } from '../graphql';

const SplitInvoice: React.FC = () => {
  const [payers, setPayers] = useState({});
  const [invoiceValue, setInvoiceValue] = useState(0);
  const [isTotalAmountReachedError, setIsTotalAmountReachedError] = useState(
    false
  );
  const [isFormInvalid, setIsFormInvalid] = useState(false);
  const [isAmountEquallySplit, setIsAmountEquallySplit] = useState(true);
  const [payerId, setPayerId] = useState(2);

  const { id } = useParams() as any;

  const { loading, error, data } = useQuery(INVOICE_QUERY, {
    variables: {
      id,
    },
  });

  useEffect(() => {
    if (data) {
      const {
        authorFirstName,
        authorSurname,
        authorEmail,
      } = data.invoice.invoiceItem.article;
      const fullName = `${authorFirstName} ${authorSurname}`;

      const totalCharges = getTotalCharges();
      const splitCharges = (totalCharges / 2).toFixed(2);

      setInvoiceValue(totalCharges);
      setPayers({
        ...payers,
        0: { fullName, email: authorEmail, amountToPay: splitCharges },
        1: { fullName: '', email: '', amountToPay: splitCharges },
      });
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
    const individualAmount = (
      invoiceValue / Object.values(payers).length
    ).toFixed(2);

    const newPayers = { ...payers };
    Object.values(newPayers).map(
      (payer: Payer) => (payer.amountToPay = individualAmount)
    );

    setPayers(newPayers);
    setIsAmountEquallySplit(true);
  };

  const addPayer = () => {
    const newPayers = {
      ...payers,
      [payerId]: {
        fullName: '',
        email: '',
        amountToPay: '',
      },
    };
    setPayers(newPayers);
    setIsFormInvalid(false);
    setPayerId(payerId + 1);
  };

  const removePayer = (key) => {
    const newPayers = { ...payers };
    const amountRemainsEquallySplit = !newPayers[key];
    setIsAmountEquallySplit(amountRemainsEquallySplit);
    delete newPayers[key];

    setPayers(newPayers);
  };

  const update = (key: string, field: string, value: string) => {
    const newPayers = { ...payers };
    if (field === 'amountToPay') {
      setIsAmountEquallySplit(false);
    }
    newPayers[key] = { ...payers[key], [field]: value };

    setPayers(newPayers);
  };

  const isInsertedAmountValid = (amount) => {
    const validation = /^(([1-9][0-9]*(\.[0-9]{1,2})?))$/;
    return (
      validation.test(parseFloat(amount).toFixed(2)) && amount <= invoiceValue
    );
  };

  const isEmailValid = (email) => {
    const validation = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return validation.test(email);
  };

  const hasEmptyFields = ({ fullName, email, amountToPay }) =>
    !fullName || !email || !amountToPay;

  const validateForm = () => {
    const totalInsertedAmount = Object.values(payers as Payers).reduce(
      (acc: number, payer: Payer) => acc + parseFloat(payer.amountToPay || '0'),
      0
    );

    if (!isAmountEquallySplit && totalInsertedAmount !== invoiceValue) {
      setIsFormInvalid(true);
      setIsTotalAmountReachedError(true);
    } else {
      const isInvalid = Object.values(payers).some((payer: Payer) => {
        const { amountToPay, email } = payer;
        return (
          hasEmptyFields(payer) ||
          !isInsertedAmountValid(amountToPay) ||
          !isEmailValid(email)
        );
      });
      setIsFormInvalid(isInvalid);
      setIsTotalAmountReachedError(false);
    }
  };

  const displayToastError = () => {
    setIsTotalAmountReachedError(false);
    return toast.error(ErrorToast);
  };

  const ErrorToast = () => (
    <div>
      <p>Total amount needs to match invoice value</p>
    </div>
  );

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

  return (
    <Container fluid={true}>
      {isTotalAmountReachedError && displayToastError()}
      <Link
        to={`/invoices/details/${id}`}
        className='text-decoration-none d-block mb-4 mt-0'
      >
        <i className='fas fa-angle-left mr-2' /> Back to invoice
      </Link>

      <HeaderMain title='Split invoice' className='mb-2 mt-0' />

      <Row className='h6'>
        <Col className='align-middle h4 text-dark font-weight-bold'>
          Amount to pay:
          <span className='text-success'>
            {` ${numeral(invoiceValue.toFixed(2)).format('$0.00')}`}
          </span>
        </Col>
      </Row>

      <Row className='mb-3'>
        <Col className='align-self-end'>
          Define the payer and the amount for each invoice
        </Col>
        <Col className='text-right'>
          <Button color='outline-secondary' onClick={addPayer}>
            Add Payer
          </Button>
        </Col>
      </Row>

      <Form
        onSubmit={(e) => {
          e.preventDefault();
          validateForm();
          // splitInvoice();
        }}
      >
        {Object.keys(payers).map((key, index) => {
          return (
            <Card key={key} body className='mb-2'>
              <CardBody className='pt-0'>
                <Row>
                  <Col className='text-right'>
                    {index > 1 && (
                      <Button
                        color='link'
                        className='p-0'
                        onClick={() => removePayer(key)}
                      >
                        <i className='fas fa-times'></i>
                      </Button>
                    )}
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <CardTitle tag='h6'>Payer #{index + 1}</CardTitle>
                  </Col>
                </Row>
                <Row>
                  <PayerInfo
                    payer={{ ...payers[key] }}
                    onChange={(field, value) => update(key, field, value)}
                    invoiceValue={invoiceValue}
                    isFormInvalid={isFormInvalid}
                  />
                </Row>
              </CardBody>
            </Card>
          );
        })}
        <Col className='mt-3 mb-4'>
          <Row>
            <Button
              color='outline-secondary link'
              className='mr-2'
              onClick={() => splitEqually()}
            >
              Split Equally
            </Button>
            <Button color='primary' type='submit'>
              Confirm & Send Invoices
            </Button>
          </Row>
        </Col>
      </Form>
    </Container>
  );
};

interface Payer {
  fullName: string;
  email: string;
  amountToPay: string;
}

interface Payers {
  [key: string]: Payer;
}

export default SplitInvoice;
