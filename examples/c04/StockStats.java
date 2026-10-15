public class StockStats {
    static int sumStock(int[] quantities) {
        int total = 0;
        for (int index = 0; index < quantities.length; index++) {
            total = total + quantities[index];
        }
        return total;
    }

    public static void main(String[] args) {
        System.out.println("total " + sumStock(new int[] {12, 0, 7, 3}));
        System.out.println("empty " + sumStock(new int[] {}));
        System.out.println("zero " + sumStock(new int[] {0}));
    }
}
