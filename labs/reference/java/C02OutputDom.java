public class C02OutputDom {
  public static void main(String[] args) {
    // region output
    String id = "P001", name = "机械键盘";
    int stock = 12, priceCents = 39900;
    System.out.println(id + " " + name + " · 库存 " + stock + " 件");
    System.out.println("库存价值 " + stock * priceCents + " 分");
    // endregion output
  }
}
