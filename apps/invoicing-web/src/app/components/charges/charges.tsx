import React from "react";
import Card from "antd/lib/card";
import List from "antd/lib/list";
import Typography from "antd/lib/typography";

const { Text } = Typography;

const charges = [
  ["Article Processing Charges", 1250.0],
  ["Net Charges", 1250.0],
  ["VAT (+20%)", 250.0],
  ["Total", 1500.0],
];

export const Charges = ({ dataSource = charges, title }: { title: string; dataSource?: any }) => (
  <Card type="inner" title={title}>
    <List
      dataSource={dataSource}
      renderItem={item => (
        <List.Item>
          <Text strong>{item[0]}</Text> <Text strong>$</Text>
          {item[1]}
        </List.Item>
      )}
    />
  </Card>
);
