export class FormatUtils {
  public static formatPrice(n: number): string {
    return n.toLocaleString('en-GB', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    });
  }
}
