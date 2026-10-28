import java.util.*;
import java.util.concurrent.*;
import java.util.function.*;
public class C13HttpStatus {
  public static void main(String[] args) {
    // region compare
    int status = 404;
    try {
      if (status < 200 || status >= 300) throw new IllegalStateException("HTTP " + status);
      System.out.println("读取业务数据");
    } catch (IllegalStateException error) {
      System.out.println(error.getMessage());
    }
    // endregion compare
  }
}
