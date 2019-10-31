import React from "react";
import Form from "antd/es/form";
import Input from "antd/es/input";
import Button from "antd/es/button";

interface Props {
  billingAddress?: any;
  onSubmit?(step: number, billingAddress: any): void;
  onChange?(e: React.SyntheticEvent<HTMLElement>): void;
}

export const BillingAddress: React.FC<Props> = ({ billingAddress, onChange, onSubmit }) => {
  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSubmit(2, billingAddress);
  };

  return (
    <Form {...formItemLayout} style={{ marginTop: "30px" }} onSubmit={handleSubmit}>
      <Form.Item label="Street Address">
        <Input
          name="address"
          onChange={onChange}
          placeholder="street"
          value={billingAddress.address}
        />
      </Form.Item>
      <Form.Item label="Zip Code">
        <Input name="postalCode" value={billingAddress.postalCode} onChange={onChange} />
      </Form.Item>
      <Form.Item label="City">
        <Input name="city" placeholder="City" value={billingAddress.city} onChange={onChange} />
      </Form.Item>
      <Form.Item label="Country">
        <Input name="country" value={billingAddress.country} onChange={onChange} />
      </Form.Item>
      <Form.Item {...tailFormItemLayout}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

// #region styles
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
