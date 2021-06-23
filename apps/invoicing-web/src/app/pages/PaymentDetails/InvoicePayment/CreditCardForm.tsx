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
  // numberField: React.RefObject<unknown>;
  // emailField: React.RefObject<unknown>;
  braintree: React.RefObject<unknown>;
  emailField: React.RefObject<unknown>;
  billingPhoneNumberField: React.RefObject<unknown>;
  billingGivenNameField: React.RefObject<unknown>;
  billingSurnameField: React.RefObject<unknown>;
  billingStreetAddressField: React.RefObject<unknown>;
  billingExtendedAddressField: React.RefObject<unknown>;
  billingLocalityField: React.RefObject<unknown>;
  billingRegionField: React.RefObject<unknown>;
  billingPostalCodeField: React.RefObject<unknown>;
  billingCountryCodeField: React.RefObject<unknown>;
  hf: any;
  threeDS: any;

  constructor(props: any) {
    super(props);

    // this.numberField = React.createRef();
    this.emailField = React.createRef();
    this.billingPhoneNumberField = React.createRef();
    this.billingGivenNameField = React.createRef();
    this.billingSurnameField = React.createRef();
    this.billingStreetAddressField = React.createRef();
    this.billingExtendedAddressField = React.createRef();
    this.billingLocalityField = React.createRef();
    this.billingRegionField = React.createRef();
    this.billingPostalCodeField = React.createRef();
    this.billingCountryCodeField = React.createRef();
    // this.braintree = React.createRef();

    ["start", "getClientToken", "onFetchClientToken", "setupComponents", "setupForm", "enablePayNow", "onSubmit"].forEach(
      prop => (this[prop] = this[prop].bind(this)),
    );
  }

  state = {
    isBraintreeReady: false,
    numberFocused: false,
    error: null
  };

   componentDidMount() {
    this.start();
  }

  start() {
    // this.getClientToken();

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

  getClientToken() {
    var xhr = new XMLHttpRequest();
    var self = this;

    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status === 201) {
        self.onFetchClientToken(JSON.parse(xhr.responseText).client_token);
      }
    };
    xhr.open("GET", "https://braintree-sample-merchant.herokuapp.com/client_token", true);

    xhr.send();
  }

  onFetchClientToken(clientToken) {

    var self = this;
    return this.setupComponents(clientToken).then(function(instances) {
      self.hf = instances[0];
      self.threeDS = instances[1];

      self.setupForm();
    }).catch(function (err) {
       console.log('component error:', err);
    });
  }

  setupComponents (clientToken) {
    return Promise.all([
      (braintree as any).hostedFields.create({
        authorization: clientToken,
        styles: {
          input: {
            'font-size': '14px',
            'font-family': 'monospace',
            'letter-spacing': "2px",
            'word-spacing': "4px",
            'width': "100%",
            'color': "rgb(161, 161, 161)",
          }
        },
        fields: {
          number: {
            selector: '#hf-number',
            placeholder: '4111 1111 1111 1111'
          },
          cvv: {
            selector: '#hf-cvv',
            placeholder: '123'
          },
          expirationDate: {
            selector: '#hf-date',
            placeholder: '12/34'
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
    console.info('enable Pay Now');
    this.setState({ isBraintreeReady: true });
  }

  // onError(error: any) {
  //   this.setState({ error });
  // }

  // getToken() {
  //   (this as any)
  //   .tokenize()
  //   .then((token: any) => {
  //       this.setState(
  //         state => ({ ...state, token, error: null }),
  //         () => {
  //           const ccPayload = {
  //             paymentMethodNonce: token.nonce,
  //             paymentMethodId: this.props.paymentMethodId,
  //             payerId: this.props.payerId,
  //             amount: this.props.total,
  //           };
  //           this.props.handleSubmit(ccPayload);
  //         },
  //       );
  //     })
  //     .catch(error => this.setState({ token: null, error }));
  // }

  // renderResult(title: string, obj: any) {
  //   if (!obj) {
  //     return null;
  //   }
  //   return (
  //     <div>
  //       <b>{title}:</b>
  //       <pre>{JSON.stringify(obj, null, 4)}</pre>
  //     </div>
  //   );
  // }

  // renderError(title: string, obj: any) {
  //   if (!obj && !this.props.serverError) {
  //     return null;
  //   }

  //   if (obj && obj.code && obj.code === 'HOSTED_FIELDS_FIELDS_EMPTY') {
  //     return (
  //       <Text type="warning">{'All fields are empty'}</Text>
  //       );
  //   } else if (obj && obj.code && obj.code === 'HOSTED_FIELDS_FIELDS_INVALID') {
  //     const map = []
  //     if (obj.details && 'invalidFields' in obj.details) {
  //       const invalids = Object.values(obj.details.invalidFieldKeys).reduce((acc: any[], invalidFieldKey) => {
  //         let txt = '';
  //         if (invalidFieldKey === 'number') {
  //           txt = '\u2022 Please enter a valid credit card number'
  //         }
  //         if (invalidFieldKey === 'expirationDate') {
  //           txt = '\u2022 Please enter a valid expiration date'
  //         }
  //         if (invalidFieldKey === 'cvv') {
  //           txt = '\u2022 Please enter a valid CVV'
  //         }
  //         if (invalidFieldKey === 'postalCode') {
  //           txt = '\u2022 Please enter a valid postal code'
  //         }
  //         acc.push(<Text type="warning">{txt}</Text>)
  //         return acc;
  //       }, []);

  //       return ([
  //         <Text key={'msg'} type="warning">{'Some payment input fields are invalid: '}</Text>
  //       ] as any).concat(invalids)
  //     }
  //   } else if (this.props.serverError && !obj && !obj) {
  //     let errorText = this.props.serverError;
  //     // Eliminate duplicated text, as this is how it's being returned from Braintree
  //     if (this.props.serverError.indexOf('Postal code can only contain letters, numbers, spaces, and hyphens') > -1) {
  //       errorText = 'Postal code can only contain letters, numbers, spaces and hyphens.';
  //     }

  //     return (
  //       <Text type="warning">{errorText}</Text>
  //     );
  //   }
  // }

  // onAuthorizationSuccess() {
  //   this.setState({ isBraintreeReady: true });
  //   // (this.numberField.current as any).focus();
  //   // const { client } = this.braintree.current.api;
  //   // console.info(this.braintree.current.three3DSecure);
  // }

  onSubmit() {
    var self = this;

    // gather form data
    const emailValue = (this.emailField.current as any).value;
    const billingPhoneNumberValue = (this.billingPhoneNumberField.current  as any).value;
    const billingGivenNameValue = (this.billingGivenNameField.current as any).value;
    const billingSurnameValue = (this.billingSurnameField.current as any).value;
    const billingStreetAddressValue = (this.billingStreetAddressField.current as any).value;
    const billingExtendedAddressValue = (this.billingExtendedAddressField.current as any).value;
    const billingLocalityValue = (this.billingLocalityField.current as any).value;
    const billingRegionValue = (this.billingRegionField.current as any).value;
    const billingPostalCodeValue = (this.billingPostalCodeField.current as any).value;
    const billingCountryCodeValue = (this.billingCountryCodeField.current as any).value;

    this.hf.tokenize().then(function (payload) {
      return self.threeDS.verifyCard({
        onLookupComplete: function (data, next) {
          next();
        },
        amount: '100.00',
        nonce: payload.nonce,
        bin: payload.details.bin,
        email: emailValue,
        billingAddress: {
          givenName: billingGivenNameValue,
          surname: billingSurnameValue,
          phoneNumber: billingPhoneNumberValue.replace(/[\(\)\s\-]/g, ''), // remove (), spaces, and - from phone number
          streetAddress: billingStreetAddressValue,
          extendedAddress: billingExtendedAddressValue,
          locality: billingLocalityValue,
          region: billingRegionValue,
          postalCode: billingPostalCodeValue,
          countryCodeAlpha2: billingCountryCodeValue
        }
      })
    }).then(function (payload) {
      if (!payload.liabilityShifted) {
        console.log('Liability did not shift', payload);
        console.info('Liability not shifted', payload);
        return;
      }

      console.log('verification success:', payload);
      console.info('SUCCESS:', payload);
        // send nonce and verification data to your server
    }).catch(function (err) {
      console.log(err);
      // enablePayNow();
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

        {/* <Braintree
          ref={this.braintree}
          authorization={this.props.ccToken}
          onAuthorizationSuccess={this.onAuthorizationSuccess}
          onError={this.onError}
          // onCardTypeChange={this.onCardTypeChange}
          getTokenRef={(t: any) => ((this as any).tokenize = t)}
          styles={{
            input: {
              "font-size": "14px",
              "font-family": "courier, monospace",
              "letter-spacing": "2px",
              "word-spacing": "4px",
              width: "100%",
              color: "rgb(161, 161, 161)",
            },
            "#credit-card-number": {
              "text-align": "left",
              "margin-bottom": "10px",
            },
            ":focus": {
              color: "rgb(51, 51, 51)",
            },
          }}
        > */}
          <CardContainer
            className={this.state.isBraintreeReady ? "" : "disabled"}
          >
              <FormGroup>
                <Label required htmlFor="emailAddress">
                  Email address
                </Label>
                <input
                  className="form-control"
                  placeholder={
                    "your.email@email.com"
                  }
                  ref={this.emailField}
                  type="email"
                />
                <span id="help-email" className="help-block"></span>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="billing-phone">
                Billing phone number
                </Label>
                <input
                  id="billing-phone"
                  ref={this.billingPhoneNumberField}
                  className="form-control"
                  placeholder={
                    "123-456-7890"
                  }
                  type="text"
                />
                <span id="help-billing-phone" className="help-block"></span>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="billing-given-name">
                Billing given name
                </Label>
                <input
                  ref={this.billingGivenNameField}
                  id="billing-given-name"
                  className="form-control"
                  placeholder={
                    "First"
                  }
                  type="text"
                />
                <span id="help-billing-given-name" className="help-block"></span>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="billing-surname">
                Billing surname
                </Label>
                <input
                  ref={this.billingSurnameField}
                  id="billing-surname"
                  className="form-control"
                  placeholder={
                    "Last"
                  }
                  type="text"
                />
                <span id="help-billing-surname" className="help-block"></span>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="billing-street-address">
                Billing street address
                </Label>
                <input
                  ref={this.billingStreetAddressField}
                  id="billing-street-address"
                  className="form-control"
                  placeholder={
                    "123 Street"
                  }
                  type="text"
                />
                <span id="help-billing-street-address" className="help-block"></span>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="billing-extendend-address">
                Billing extended address
                </Label>
                <input
                  ref={this.billingExtendedAddressField}
                  id="billing-extended-address"
                  className="form-control"
                  placeholder={
                    "Unit 1"
                  }
                  type="text"
                />
                <span id="help-billing-extended-address" className="help-block"></span>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="billing-locality">
                Billing locality
                </Label>
                <input
                ref={this.billingLocalityField}
                  id="billing-locality"
                  className="form-control"
                  placeholder={
                    "City"
                  }
                  type="text"
                />
                <span id="help-billing-locality" className="help-block"></span>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="billing-region">
                Billing region
                </Label>
                <input
                  ref={this.billingRegionField}
                  id="billing-region"
                  className="form-control"
                  placeholder={
                    "State"
                  }
                  type="text"
                />
                <span id="help-billing-region" className="help-block"></span>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="billing-postal-code">
                Billing postal code
                </Label>
                <input
                  ref={this.billingPostalCodeField}
                  id="billing-postal-code"
                  className="form-control"
                  placeholder={
                    "12345"
                  }
                  type="text"
                />
                <span id="help-billing-postal-code" className="help-block"></span>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="billing-country-code">
                Billing country code (Alpha 2)
                </Label>
                <input
                  ref={this.billingCountryCodeField}
                  id="billing-country-code"
                  className="form-control"
                  placeholder={
                    "XX"
                  }
                  type="text"
                />
                <span id="help-billing-country-code" className="help-block"></span>
              </FormGroup>

              <FormGroup>
                <Label required htmlFor="cardNumber">
                  Card Number
                </Label>
                <div
                  className="form-control"
                  id="hf-number"
                />
              </FormGroup>

              <FormGroup>
                <Label required htmlFor="expirationDate">
                  Expiration Date
                </Label>
                <div className="form-control" id="hf-date" />
              </FormGroup>
              <FormGroup>
                <Label required htmlFor="cvv">
                  CVV
                </Label>
                <div className="form-control" id="hf-cvv" />
              </FormGroup>
            {/* <Flex vertical mr={4}>
              <Label required htmlFor="postalCode">
                Postal Code
              </Label>
              <input id="" type="postalCode" />
            </Flex> */}

            <Button
              mt={6}
              mb={2}
              size="medium"
              onClick={this.onSubmit}
              loading={this.props.loading}
            >
              Pay
            </Button>
          </CardContainer>
        {/* </Braintree> */}

        {/*this.renderError('Error', this.state.error)*/}
      </Flex>
    );
  }
}

export default CreditCardForm;

const CardContainer = styled('div')`
  width: 100%;
  background-color: ${th("colors.background")};
  border-radius: ${th("gridUnit")};
  padding: 0 calc(${th("gridUnit")} * 4);
  padding-top: calc(${th("gridUnit")} * 3);
  padding-bottom: calc(${th("gridUnit")} * 3);

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
    padding: 0 1rem;
  }
  .braintree-hosted-field.braintree-hosted-field-focused {
    border-color: rgb(51, 51, 51);
  }
  .braintree-hosted-field.error {
    border-color: rgb(254, 186, 172);
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
`;
