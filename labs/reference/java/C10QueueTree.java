import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.List;
public class C10QueueTree {
  record Node(String name, List<Node> children) {}
  static Node n(String name, Node... children) { return new Node(name,List.of(children)); }
  // region bfs
  static List<String> breadthFirst(Node root) {
    List<String> names = new ArrayList<>();
    if (root == null) return names;
    var queue = new ArrayDeque<Node>(); queue.add(root);
    while (!queue.isEmpty()) {
      Node node = queue.removeFirst(); names.add(node.name());
      queue.addAll(node.children());
    }
    return names;
  }
  // endregion bfs
  public static void main(String[] args) {
    var root = n("全部商品",n("外设",n("P001"),n("P002")),n("显示器",n("P003")),n("配件",n("P004"),n("P005")),n("音频",n("P006")));
    System.out.println(String.join(",",breadthFirst(root)));
  }
}
