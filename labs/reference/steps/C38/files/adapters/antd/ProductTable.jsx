import React from "react";
import { Button, Table } from "antd";
import { formatPriceCents } from "../../src/core/inventory.js";

export default function ProductTable({ products, onEdit }) {
  const columns = [
    { title: "编号", dataIndex: "id", width: 90 },
    { title: "商品", dataIndex: "name", width: 190 },
    { title: "分类", dataIndex: "category", width: 90 },
    { title: "库存", dataIndex: "stock", width: 90, sorter: (a, b) => a.stock - b.stock },
    { title: "价格（元）", dataIndex: "priceCents", width: 120,
      sorter: (a, b) => a.priceCents - b.priceCents, render: formatPriceCents },
    { title: "标签", dataIndex: "tags", width: 130, render: (tags) => tags.join("、") || "—" },
    { title: "操作", key: "edit", width: 100, render: (_value, record, index) =>
      <Button aria-label={`编辑 ${record.id}`} onClick={(event) => onEdit({ id: record.id, index }, event.currentTarget)}>编辑</Button> },
  ];
  return <div className="antd-table"><Table rowKey="id" dataSource={products} columns={columns}
    pagination={false} scroll={{ x: 810 }} locale={{ emptyText: "没有符合条件的商品" }} /></div>;
}
