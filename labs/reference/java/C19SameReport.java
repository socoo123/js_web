import java.util.*;
import java.util.concurrent.*;
import java.util.function.*;
public class C19SameReport {
  public static void main(String[] args) {
    // region compare
    int[] stocks = {12, 0, 7, 3, 25, 5};
    System.out.println(Arrays.stream(stocks).sum());
    // endregion compare
  }
}
