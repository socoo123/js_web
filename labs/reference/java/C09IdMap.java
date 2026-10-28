import java.util.Map;
import java.util.HashMap;
public class C09IdMap {
  record Product(String id, int stock) {}
  // region index
  static Map<String,Product> indexProducts(Product[] products) {
    Map<String,Product> byId = new HashMap<>();
    for (Product product : products) {
      if (byId.containsKey(product.id())) throw new IllegalArgumentException("重复编号");
      byId.put(product.id(), product);
    }
    return byId;
  }
  // endregion index
  public static void main(String[] args) {
    Product[] products = {new Product("P001",12),new Product("P002",0),new Product("P003",7),new Product("P004",3),new Product("P005",25),new Product("P006",5)};
    var index = indexProducts(products);
    System.out.println(index.get("P004").stock()); System.out.println(index.size());
  }
}
