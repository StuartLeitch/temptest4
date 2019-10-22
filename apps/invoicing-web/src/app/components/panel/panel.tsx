import React from "react";
import Card from "antd/es/card";

export const Panel = ({ title, children }: { title: string; children?: any }) => (
  <Card title={title} style={{ width: "96%" }}>
    {children}
  </Card>
);
