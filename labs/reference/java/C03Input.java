public class C03Input {
  // region stock-input
  static int restock(int stock, String text) {
    int amount = Integer.parseInt(text.trim());
    if (stock < 0 || stock > 99999
        || amount < 0 || amount > 99999 - stock) {
      throw new IllegalArgumentException("库存越界");
    }
    return stock + amount;
  }
  // endregion stock-input
  public static void main(String[] args) {
    System.out.println(restock(12, "3"));
  }
}
