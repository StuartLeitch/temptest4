declare namespace jest {
  interface Matchers<R, T> {
    toMatchPdf(name: string): R;
  }
}
