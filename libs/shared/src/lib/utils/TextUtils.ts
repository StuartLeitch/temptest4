export class TextUtils {
  public static isUUID(text: string): boolean {
    return new RegExp(
      '\x20[0-9a-f]{8}\x20-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\x20[0-9a-f]{12}\x20'
    ).test(text);
  }
}
