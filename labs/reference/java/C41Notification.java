import java.beans.PropertyChangeSupport;
public class C41Notification {
  static class ProductBean {
    int stock = 3;
    final PropertyChangeSupport events = new PropertyChangeSupport(this);
    void setStock(int value) {
      int before = stock;
      stock = value;
      events.firePropertyChange("stock", before, value);
    }
  }
  public static void main(String[] args) {
    // region notification
    ProductBean product = new ProductBean();
    product.events.addPropertyChangeListener(event ->
      System.out.println("P004:" + event.getOldValue() + "->" + event.getNewValue()));
    product.setStock(8);
    // endregion notification
  }
}
