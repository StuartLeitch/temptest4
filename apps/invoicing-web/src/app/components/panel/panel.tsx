import React from "react";
import Card from "antd/lib/card";

export const Panel = ({ title, children }: { title: string; children?: any }) => (
  <Card title={title} style={{ width: "96%" }}>
    {children}
  </Card>
);
