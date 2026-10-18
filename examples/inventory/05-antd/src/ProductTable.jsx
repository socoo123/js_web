import { Button, Empty, Space, Table, Tag } from "antd";
import { formatPriceCents } from "../../04-react/src/product-form.js";

export default function ProductTable({ products, onEdit, onRemove, onRestock }) {
  const columns = [
    { title: "编号", dataIndex: "id", width: 90 },
    { title: "商品", dataIndex: "name", width: 190 },
    { title: "分类", dataIndex: "category", width: 100 },
    { title: "库存", dataIndex: "stock", width: 100, sorter: (a, b) => a.stock - b.stock },
    { title: "价格（元）", dataIndex: "priceCents", width: 130,
      sorter: (a, b) => a.priceCents - b.priceCents, render: (cents) => formatPriceCents(cents) },
    { title: "标签", dataIndex: "tags", width: 150,
      render: (tags) => tags.length ? tags.map((tag) => <Tag key={tag}>{tag}</Tag>) : "—" },
    { title: "操作", key: "actions", width: 250, render: (_value, record) => <Space>
      <Button aria-label={`编辑${record.name}`} onClick={() => onEdit(record.id)}>编辑</Button>
      <Button aria-label={`补货${record.name}`} onClick={() => onRestock(record.id)}>补货</Button>
      <Button danger aria-label={`删除${record.name}`} onClick={() => onRemove(record.id)}>删除</Button>
    </Space> },
  ];
  return <Table rowKey="id" columns={columns} dataSource={products} pagination={false}
    scroll={{ x: 1110 }} locale={{ emptyText: <Empty description="没有符合条件的商品" /> }} />;
}
