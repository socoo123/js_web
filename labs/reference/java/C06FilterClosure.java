import java.util.Arrays;
import java.util.function.Predicate;
import java.util.stream.Collectors;
public class C06FilterClosure {
  record Product(String id, String category) {}
  // region factory
  static Predicate<Product> createCategoryFilter(String category) {
    return product -> product.category().equals(category);
  }
  // endregion factory
  public static void main(String[] args) {
    Product[] products = {new Product("P001","外设"),new Product("P002","外设"),new Product("P003","显示器"),new Product("P004","配件"),new Product("P005","配件"),new Product("P006","音频")};
    System.out.println(Arrays.stream(products).filter(createCategoryFilter("外设")).map(Product::id).collect(Collectors.joining(",")));
  }
}
