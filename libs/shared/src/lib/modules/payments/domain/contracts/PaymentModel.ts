// Empty interface just to ensure that we get a compile
// error if we pass a model that does not belong to our
// payment system.
export interface PaymentModel {
  getType(): Symbol;
}
