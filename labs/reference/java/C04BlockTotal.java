public class C04BlockTotal {
  record Product(int stock) {}
  // region total
  static int totalStock(Product[] products) {
    int total = 0;
    for (Product product : products) total += product.stock();
    return total;
  }
  // endregion total
  public static void main(String[] args) {
    Product[] products = {new Product(12),new Product(0),new Product(7),new Product(3),new Product(25),new Product(5)};
    System.out.println(totalStock(products));
  }
}
