import React, { useState, useEffect } from 'react';
import { Link, useParams, useHistory } from 'react-router-dom';
import { useQuery, useMutation } from 'graphql-hooks';
import LoadingOverlay from 'react-loading-overlay';
import DatePicker from 'react-datepicker';
import format from 'date-fns/format';
// import subWeeks from 'date-fns/subWeeks';
import compareDesc from 'date-fns/compareDesc';
import { toast } from 'react-toastify';
import Toggle from 'react-toggle';
import numeral from 'numeral';
import gql from 'graphql-tag';

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

const REMINDERS_STATUS_QUERY = `
  query remindersStatus($id: ID!) {
    remindersStatus(invoiceId: $id) {
      confirmation
      payment
    }
  }
`;

const TOGGLE_CONFIRMATION_REMINDERS_MUTATION = `
  mutation togglePauseConfirmationReminders($id: ID!, $state: Boolean!) {
    togglePauseConfirmationReminders(invoiceId: $id, state: $state) {
      confirmation
      payment
    }
  }
`;

const TOGGLE_PAYMENT_REMINDERS_MUTATION = `
  mutation togglePausePaymentReminders($id: ID!, $state: Boolean!) {
    togglePausePaymentReminders(invoiceId: $id, state: $state) {
      confirmation
      payment
    }
  }
`;

const InvoiceReminders = () => {
  const { id } = useParams();
  const { loading: loadingStatus, error: errorStatus, data } = useQuery(
    REMINDERS_STATUS_QUERY,
    {
      variables: {
        id,
      },
    }
  );
  const [toggleConfirmationPause] = useMutation(
    TOGGLE_CONFIRMATION_REMINDERS_MUTATION
  );
  const [togglePaymentPause] = useMutation(TOGGLE_PAYMENT_REMINDERS_MUTATION);
  const [loading, setLoading] = useState(loadingStatus);
  const [error, setError] = useState(errorStatus);
  const [remindersPauseState, setRemindersPauseState] = useState({
    confirmation: true,
    payment: true,
  });

  useEffect(() => {
    setLoading(loadingStatus);
    setError(errorStatus);
    if (data) {
      setRemindersPauseState(data.remindersStatus);
    }
  }, [loadingStatus, errorStatus, data]);

  if (loading)
    return (
      <LoadingOverlay
        active={loading}
        spinner={
          <Spinner style={{ width: '12em', height: '12em' }} color='primary' />
        }
      />
    );

  if (error || typeof data === undefined)
    return <div>Something Bad Happened</div>;

  return (
    <React.Fragment>
      <Card body className='border-top-0'>
        <CardTitle tag='h6' className='mb-4'>
          Reminders
        </CardTitle>

        <dl className='row'>
          <dt className={`col-sm-4 text-lg-right`}>Confirmation Reminders</dt>
          <dd className={`col-sm-8`}>
            <label className='d-flex align-items-middle mb-0 align-items-center'>
              <span className='badge badge-primary mr-4 text-monospace'>
                Active
              </span>
              <Toggle
                checked={!remindersPauseState.confirmation}
                onChange={() => {
                  setLoading(true);
                  toggleConfirmationPause({
                    variables: {
                      id,
                      state: !remindersPauseState.confirmation,
                    },
                  }).then((response) => {
                    const { data, loading, error } = response;

                    setLoading(loading);
                    setError(error);
                    setRemindersPauseState(
                      data.togglePauseConfirmationReminders
                    );
                  });
                }}
                name='confirmation'
              />
            </label>
          </dd>
          <dt className={`col-sm-4 text-lg-right`}>Payment Reminders</dt>
          <dd className={`col-sm-8`}>
            <label className='d-flex align-items-middle mb-0 align-items-center'>
              <span className='badge badge-danger mr-4 text-monospace'>
                Paused
              </span>
              <Toggle
                checked={!remindersPauseState.payment}
                onChange={() => {
                  setLoading(true);
                  togglePaymentPause({
                    variables: {
                      id,
                      state: !remindersPauseState.payment,
                    },
                  }).then((response) => {
                    const { data, loading, error } = response;

                    setLoading(loading);
                    setError(error);
                    setRemindersPauseState(data.togglePausePaymentReminders);
                  });
                }}
                name='payment'
              />
            </label>
          </dd>
        </dl>
      </Card>
    </React.Fragment>
  );
};

export { InvoiceReminders };
