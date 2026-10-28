import java.util.*;
import java.util.concurrent.*;
import java.util.function.*;
public class C17FileBase {
  public static void main(String[] args) {
    // region compare
    var base = java.net.URI.create("file:///workspace/src/cli/report.js");
    System.out.println(base.resolve("../../data/products.json"));
    // endregion compare
  }
}
