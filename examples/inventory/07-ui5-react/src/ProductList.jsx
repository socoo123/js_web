import { List } from "@ui5/webcomponents-react/List";
import { ListItemStandard } from "@ui5/webcomponents-react/ListItemStandard";

export function ProductList({ products, selectedId, onSelect }) {
  function handleItemClick(event) {
    onSelect(event.detail.item.dataset.productId);
  }
  return (
    <List accessibleName="商品列表" noDataText="没有匹配的商品" onItemClick={handleItemClick}>
      {products.map((product) => (
        <ListItemStandard key={product.id} data-product-id={product.id} type="Active"
          description={`${product.id} · ${product.category} · 库存 ${product.stock} 件`}
          additionalText={product.id === selectedId ? "编辑中" : `${(product.priceCents / 100).toFixed(2)} 元`}>
          {product.name}
        </ListItemStandard>
      ))}
    </List>
  );
}
