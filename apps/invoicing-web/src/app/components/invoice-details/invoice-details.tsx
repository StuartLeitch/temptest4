import React from "react";
import Card from "antd/es/card";
import List from "antd/es/list";
import Typography from "antd/es/typography";

const { Text } = Typography;

const invoiceDetails = [
  ["Invoice Issue Date", "19 September 2019"],
  ["Date of Supply", "19 September 2019"],
  ["Reference Number", "483/2019"],
  ["Terms", "Payable upon Receipt"],
];

export const InvoiceDetails = ({
  dataSource = invoiceDetails,
  title,
}: {
  title: string;
  dataSource?: any;
}) => (
  <Card type="inner" title={title}>
    <List
      dataSource={dataSource}
      renderItem={item => (
        <List.Item>
          <Text strong>{item[0]}</Text> {item[1]}
        </List.Item>
      )}
    />
  </Card>
);
