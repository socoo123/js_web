import java.util.ArrayList;
import java.util.List;
public class C05DraftCopy {
  public static void main(String[] args) {
    // region draft
    var tags = new ArrayList<>(List.of("热销"));
    var draftTags = new ArrayList<>(tags);
    draftTags.add("仅草稿");
    System.out.println(tags);
    System.out.println(draftTags);
    // endregion draft
  }
}
