export class Checkout {
  public async execute({
    // payer,
    invoice,
    generalCheckout,
    hasPayerAskedForAReprint,
    hasPayerConfirmedNumberOfCopies,
    hasPayerConfirmedShippingAddress,
    setShippingAddress,
    calculatesShippingCost,
    createsPrintOrder,
    payInvoice,
    sendPrintingOrder,
    updatePrintOrder
  }: any) {
    // * System executes “General Check-out”
    await generalCheckout();
    // * System asks the payer if he/she wants a reprint
    if (await hasPayerAskedForAReprint()) {
      // * System creates a print order
      await createsPrintOrder();
      // * System prompts user to confirm the number of copies
      // * User confirms the selected number of copies
      await hasPayerConfirmedNumberOfCopies();
      // * System fills shipping address with invoice address
      const shippingAddress = await setShippingAddress(invoice);
      // * User reviews and updates shipping address
      await hasPayerConfirmedShippingAddress(shippingAddress);
      // * System determines the value of the shipping costs
      const shippingCost = await calculatesShippingCost();
      // * System updates the invoice value
      await invoice.setValueWith(shippingCost);
    }
    // * System executes “Pay Invoice“
    await payInvoice(invoice);
    // * System sends printing order
    await sendPrintingOrder();
    // * System updates the print order
    await updatePrintOrder();
  }
}
