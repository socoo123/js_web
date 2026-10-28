import java.util.*;
import java.util.concurrent.*;
import java.util.function.*;
public class C20BoundaryAssert {
  public static void main(String[] args) {
    // region compare
    int zero = Integer.parseInt("0");
    if (zero != 0) throw new AssertionError("零库存应保留");
    boolean rejected = false;
    try { Integer.parseInt(""); } catch (NumberFormatException error) { rejected = true; }
    if (!rejected) throw new AssertionError("空白应拒绝");
    System.out.println("零库存与空白边界通过");
    // endregion compare
  }
}
