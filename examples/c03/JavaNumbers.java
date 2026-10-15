import java.math.BigDecimal;

public class JavaNumbers {
    public static void main(String[] args) {
        System.out.println(5 / 2);
        System.out.println(0.1 + 0.2);
        System.out.println(1.0 / 0);
        System.out.println(0.0 / 0);
        System.out.println(new BigDecimal("0.1").add(new BigDecimal("0.2")));
        try {
            System.out.println(1 / 0);
        } catch (ArithmeticException error) {
            System.out.println("ArithmeticException: " + error.getMessage());
        }
        try {
            Integer.parseInt("3件");
        } catch (NumberFormatException error) {
            System.out.println("NumberFormatException: " + error.getMessage());
        }
    }
}
