import java.util.*;
import java.util.concurrent.*;
import java.util.function.*;
public class C14StringSnapshot {
  public static void main(String[] args) {
    // region compare
    Map<String, String> storage = new HashMap<>();
    String text = "{\"version\":1,\"products\":[]}";
    storage.put("inventory", text);
    System.out.println(storage.get("inventory"));
    // endregion compare
  }
}
