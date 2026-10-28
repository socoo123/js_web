import java.util.*;
import java.util.concurrent.*;
import java.util.function.*;
public class C11IdentityEvent {
  public static void main(String[] args) {
    // region compare
    var stock = new LinkedHashMap<>(Map.of("P001", 12, "P004", 3));
    BiConsumer<String, Integer> onSave = (id, value) -> stock.put(id, value);
    onSave.accept("P004", 8);
    System.out.println("P004=" + stock.get("P004") + ", P001=" + stock.get("P001"));
    // endregion compare
  }
}
