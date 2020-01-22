export interface Output<T = any> {
  write(o: T): void;
}
