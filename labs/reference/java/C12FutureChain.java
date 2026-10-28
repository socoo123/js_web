import java.util.*;
import java.util.concurrent.*;
import java.util.function.*;
public class C12FutureChain {
  public static void main(String[] args) {
    // region compare
    var loaded = CompletableFuture.completedFuture(0)
        .thenCompose(ignored -> CompletableFuture.supplyAsync(() -> List.of("P001", "P002", "P003", "P004", "P005", "P006")));
    System.out.println(loaded.thenApply(List::size).join());
    // endregion compare
  }
}
