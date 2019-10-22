import React from "react";
import Form from "antd/es/form";
import Icon from "antd/es/icon";
import Input from "antd/es/input";
import Button from "antd/es/button";

const BillingAddressForm = () => {
  const [values, setValues] = React.useState({
    street: "",
    zip: "",
    city: "",
    country: "",
  });

  const handleChange = React.useCallback(
    event => {
      const { name, value } = event.target;
      setValues(v => ({ ...v, [name]: value }));
    },
    [setValues],
  );

  const [focused, setFocus] = React.useState<any | undefined>(undefined);
  const handleFocus = React.useCallback(event => setFocus(event.target.name as any), [setFocus]);
  const handleBlur = React.useCallback(() => setFocus(undefined), [setFocus]);

  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 8 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 16 },
    },
  };

  const tailFormItemLayout = {
    wrapperCol: {
      xs: {
        span: 24,
        offset: 0,
      },
      sm: {
        span: 16,
        offset: 8,
      },
    },
  };

  return (
    <Form {...formItemLayout} style={{ marginTop: "30px" }}>
      <Form.Item label="Street Address">
        <Input placeholder="street" name="street" value={values.street} />
      </Form.Item>
      <Form.Item label="Zip Code">
        <Input name="zip" value={values.zip} />
      </Form.Item>
      <Form.Item label="City">
        <Input name="city" placeholder="City" value={values.city} />
      </Form.Item>
      <Form.Item label="Country">
        <Input name="country" value={values.country} />
      </Form.Item>
      <Form.Item {...tailFormItemLayout}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

const WrappedBillingAddressForm = Form.create({ name: "billing_address_form" })(BillingAddressForm);

export const BillingAddress = WrappedBillingAddressForm;
