import java.util.*;
import java.util.concurrent.*;
import java.util.function.*;
public class C18ScriptCommand {
  public static void main(String[] args) {
    // region compare
    var command = new ProcessBuilder("node", "src/cli/report.js");
    System.out.println(String.join(" ", command.command()));
    // endregion compare
  }
}
