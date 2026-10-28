import java.util.Map;
import java.util.function.Function;
public class C07BoundMethod {
  record Product(String id, int stock) {}
  static class Inventory {
    final Map<String,Product> products = Map.of("P004",new Product("P004",3));
    Product getById(String id) { return products.get(id); }
  }
  public static void main(String[] args) {
    // region receiver
    Inventory inventory = new Inventory();
    Function<String,Product> lookup = inventory::getById;
    System.out.println(lookup.apply("P004").stock());
    // endregion receiver
  }
}
