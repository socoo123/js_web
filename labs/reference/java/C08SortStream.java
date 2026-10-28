import java.util.Comparator;
import java.util.List;
public class C08SortStream {
  record Product(String id, int stock) {}
  // region sort
  static List<Product> sortByStock(List<Product> products) {
    return products.stream().sorted(Comparator.comparingInt(Product::stock)).toList();
  }
  // endregion sort
  public static void main(String[] args) {
    var products = List.of(new Product("P001",12),new Product("P002",0),new Product("P003",7),new Product("P004",3),new Product("P005",25),new Product("P006",5));
    System.out.println(sortByStock(products).stream().map(Product::id).toList());
  }
}
