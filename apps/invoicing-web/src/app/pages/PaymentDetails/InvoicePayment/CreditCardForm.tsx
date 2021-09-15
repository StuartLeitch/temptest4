import React from "react";
import styled from "styled-components";
import PaymentIcon from "./PaymentIcon";
import { Flex, Label, Button, Text, th } from "@hindawi/react-components";
// import { Braintree, HostedField } from "react-braintree-fields";

interface Props {
  handleSubmit: any;
  loading: boolean;
  ccToken: string;
  numberField?: any;
  braintree?: any;
  paymentMethodId: string;
  payerId: string;
  total: number;
  serverError: string;
}

class CreditCardForm extends React.PureComponent<Props, {}> {
  braintree: React.RefObject<unknown>;
  emailField: React.RefObject<unknown>;
  hf: any;
  threeDS: any;

  constructor(props: any) {
    super(props);

    ["start", "setupComponents", "setupForm", "enablePayNow", "onSubmit"].forEach(
      prop => (this[prop] = this[prop].bind(this)),
    );
  }

  state = {
    isBraintreeReady: false,
    numberFocused: false,
    error: null,
    loading: false
  };

   componentDidMount() {
    this.start();
  }

  start() {
    var self = this;
    const {ccToken } = this.props;

    return this.setupComponents(ccToken).then(function(instances) {
      self.hf = instances[0];
      self.threeDS = instances[1];

      self.setupForm();
    }).catch(function (err) {
       console.log('component error:', err);
    });
  }

  setupComponents (clientToken) {
    const braintree = (window as any).braintree;
    return Promise.all([
      (braintree as any).hostedFields.create({
        authorization: clientToken,
        styles: {
          '::placeholder': {
            'color': 'rgb(181, 181, 181)',
            'opacity': '1' /* Firefox */
          },
          input: {
            'font-size': '14px',
            'font-family': 'monospace',
            'letter-spacing': "2px",
            'word-spacing': "4px",
            'width': "100%",
            'color': "rgb(91, 91, 91)",
          },
          '.number': {
            'font-family': 'monospace',
            'color': "rgb(91, 91, 91)",
          },
          '.valid': {
            'color': 'green'
          }
        },
        fields: {
          number: {
            selector: '#hf-number',
            placeholder: '•••• •••• •••• ••••'
          },
          cvv: {
            selector: '#hf-cvv',
            placeholder: '•••'
          },
          expirationDate: {
            selector: '#hf-date',
            placeholder: 'MM/YYYY'
          }
        }
      }),
      (braintree as any).threeDSecure.create({
        authorization: clientToken,
        version: 2
      })
    ]);
  }

  setupForm() {
    this.enablePayNow();
  }

  enablePayNow() {
    // console.info('enable Pay Now');
    this.setState({ isBraintreeReady: true });
  }

  onError(error: any) {
    this.setState({ error });
  }

  renderError(title: string, obj: any) {

    console.info('BrainTree Server error: ', this.props.serverError);
    console.info(obj);

    if (!obj && !this.props.serverError) {
      return null;
    }

    if (this.props.serverError && !this.state.error) {
      return (<Text type="warning" key='3dsecure_error'>{'Your credit card was declined by the supplier.'}</Text>)
    }

    if (obj && ('name' in obj) && obj.name === 'BraintreeError') {
      if (obj.details?.originalError?.code) {
        return (<Text type="warning" key='3dsecure_error'>{'3D Secure authentication failed.'}</Text>)
      }

      if (obj.details?.originalError?.details?.originalError?.error) {
        return (<Text type="warning" key='braintree_error'>{obj.details.originalError.details.originalError.error.message}</Text>)
      }
    }

    if (obj && ('liabilityShifted' in obj) && obj.liabilityShifted === false) {
      return (<Text type="warning" key='3dsecure_error'>{'3D Secure authentication failed.'}</Text>)
    }

    if (obj && obj.code && obj.code === 'HOSTED_FIELDS_FIELDS_EMPTY') {
       return (
         <Text type="warning" key='all_fields_empty'>{'All fields are empty'}</Text>
      );
    } else if (obj && obj.code && obj.code === 'HOSTED_FIELDS_FIELDS_INVALID') {
      const map = []
      if (obj.details && 'invalidFields' in obj.details) {
        const invalids = Object.values(obj.details.invalidFieldKeys).reduce((acc: any[], invalidFieldKey) => {
          let txt = '';
          if (invalidFieldKey === 'number') {
            txt = '\u2022 Please enter a valid credit card number'
          }
          if (invalidFieldKey === 'expirationDate') {
            txt = '\u2022 Please enter a valid expiration date'
          }
          if (invalidFieldKey === 'cvv') {
            txt = '\u2022 Please enter a valid CVV'
          }
          acc.push(<Text type="warning" key={`${invalidFieldKey}`}>{txt}</Text>)
          return acc;
        }, []);

        return ([
          <Text key={'msg'} type="warning">{'Some payment input fields are invalid: '}</Text>
        ] as any).concat(invalids)
      }
    }
  }

  onSubmit() {
    var self = this;

    this.setState({ loading: true });

    this.hf.tokenize().then(function (payload) {

      return self.threeDS.verifyCard({
        onLookupComplete: function (data, next) {
          self.setState({ loading: false });
          next();
        },
        amount: self.props.total,
        nonce: payload.nonce,
        bin: payload.details.bin
      })
    }).then(function (token) {
      console.log(token)
      if (!token.liabilityShifted) {
        self.setState({ loading: false });
        self.onError(token);
        return;
      }

      self.setState(
        state => ({ ...state, token, error: null }),
        () => {
          
          // * send nonce and verification data to our server
          const ccPayload = {
            paymentMethodNonce: token.nonce,
            paymentMethodId: self.props.paymentMethodId,
            payerId: self.props.payerId,
            amount: self.props.total,
          };
          self.props.handleSubmit(ccPayload);
        },
      );
    }).catch(function (err: any) {
      self.setState({ loading: false });
      self.onError(err);
    });
  }

  render() {
    return (
      <Flex vertical>
        <Flex justifyContent="flex-start" mb={2}>
          <Label>Credit Card Details</Label>
          <PaymentIcon id="visa" style={{ margin: 3, width: 36 }} />
          <PaymentIcon id="maestro" style={{ margin: 3, width: 36 }} />
          <PaymentIcon id="mastercard" style={{ margin: 3, width: 36 }} />
          <PaymentIcon id="discover" style={{ margin: 3, width: 36 }} />
        </Flex>


          <CardContainer
            className={this.state.isBraintreeReady ? "" : "disabled"}
          >
            <Flex justifyContent="flex-start" mb={0} mt={3}>
              <FormGroup style={{ marginRight: '16px' }}>
                <Label required htmlFor="cardNumber">
                  Card Number
                </Label>
                <div
                  className="form-control"
                  id="hf-number"
                />
              </FormGroup>

              <FormGroup style={{ marginRight: '16px' }}>
                <Label required htmlFor="expirationDate">
                  Expiration Date
                </Label>
                <div className="form-control" id="hf-date" />
              </FormGroup>

              <FormGroup style={{ marginRight: '16px' }}>
                <Label required htmlFor="cvv">
                  CVV
                </Label>
                <div className="form-control" id="hf-cvv" />
              </FormGroup>

              <Button
                mt={0}
                mb={3}
                size="medium"
                onClick={this.onSubmit}
                loading={this.state.loading || this.props.loading}
              >
                Pay
              </Button>
            </Flex>

          </CardContainer>

        {this.renderError('Error', this.state.error)}
      </Flex>
    );
  }
}

export default CreditCardForm;

const CardContainer = styled('div')`
  width: 100%;
  background-color: ${th("colors.background")};
  border-radius: ${th("gridUnit")};
  padding: 0 16px;

  &.disabled {
    pointer-events: none;

    /* for "disabled" effect */
    opacity: 0.5;
    background: #ccc;
  }

  .braintree-hosted-field {
    background-color: rgb(255, 255, 255);
    border-radius: 4px;
    height: calc(4px * 8);
    padding: calc(4px * 2);
    height: 32px;
    border: 1px solid rgb(201, 201, 201);
    padding: 0 0rem;
  }
  .braintree-hosted-field.braintree-hosted-field-focused {
    border-color: rgb(51, 51, 51);
  }
  .braintree-hosted-field.error {
    border-color: rgb(254, 186, 172);
  }

  button {
    height: 33px;
    margin-top: 18px;
  }
`;

const FormGroup = styled('div')`
  margin-bottom: 15px;

  .label {
    display: inline-block;
    max-width: 100%;
    margin-bottom: 5px;
    font-weight: 700;
  }

  .form-control {
    display: block;
    width: 100%;
    height: 34px;
    padding: 6px 12px;
    font-size: 14px;
    line-height: 1.42857143;
    color: #555;
    background-color: #fff;
    background-image: none;
    border: 1px solid #ccc;
    border-radius: 4px;
    -webkit-box-shadow: inset 0 1px 1px rgb(0 0 0 / 8%);
    box-shadow: inset 0 1px 1px rgb(0 0 0 / 8%);
    -webkit-transition: border-color ease-in-out .15s,-webkit-box-shadow ease-in-out .15s;
    -o-transition: border-color ease-in-out .15s,box-shadow ease-in-out .15s;
    transition: border-color ease-in-out .15s,box-shadow ease-in-out .15s;
  }

  #hf-cvv {
    width: 104px;
  }
  #hf-date {
    width: 124px;
  }
`;
