import React from "react";
import Card from "antd/lib/card";
import List from "antd/lib/list";
import Typography from "antd/lib/typography";

const { Text } = Typography;

const articleDetails = [
  ["Journal Title", "Advances in Condensed Matter Physics"],
  ["Article Title", "RNA detection based on graphene field effect transistor biosensor"],
  ["Article ID", "8146765"],
  ["Article Type", "Research Article"],
  ["CC License", "CC-BY 4.0"],
  ["Corresponding Author", "Shicai Xu"],
  ["Additional Authors", "view author list"],
];

export const ManuscriptDetails = ({
  dataSource = articleDetails,
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
