public class Stock {
    public static void main(String[] args) {
        String productName = "键盘";
        int stock = 12;
        int sold = 3;
        int remaining = stock - sold;

        System.out.println(productName);
        System.out.println(remaining);
        System.out.println("剩余库存：" + remaining);
    }
}
