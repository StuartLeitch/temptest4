import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class OrderIdRequiredError extends UseCaseError {
  constructor() {
    super(`Order id is required`);
  }
}

export class PayPalOrderStatusRequiredError extends UseCaseError {
  constructor() {
    super(`PayPal order status is required`);
  }
}

export class UpdatePaymentStatusDbError extends UseCaseError {
  constructor(err: Error) {
    super(
      `While saving the new status for payment an error ocurred: ${err.message}, with stack: ${err.stack}`
    );
  }
}

export class PaymentNotInCorrectStatusForTransitionToCompletedError extends UseCaseError {
  constructor(invoiceId: string, currentStatus: string) {
    super(
      `Payment for invoice with id ${invoiceId} has status ${currentStatus} which is not correct for transition to COMPLETED`
    );
  }
}
