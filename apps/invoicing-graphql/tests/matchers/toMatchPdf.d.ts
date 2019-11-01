declare namespace jest {
  interface Matchers<R> {
    toMatchPdf(name: string): R;
  }
}
