import java.util.*;
import java.util.concurrent.*;
import java.util.function.*;
public class C15LayoutBudget {
  public static void main(String[] args) {
    // region compare
    int available = 1216 - 16 * 2;
    int gaps = 16 * 3;
    System.out.println((available - gaps) / 4);
    // endregion compare
  }
}
