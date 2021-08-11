const totalAmount = (invoice) => {
  const { vat, coupons, waivers, price } = invoice?.invoiceItem;
  const reductions = [...coupons, ...waivers];
  let totalDiscountFromReductions = reductions.reduce(
    (acc, curr) => acc + curr.reduction,
    0
  );
  totalDiscountFromReductions =
    totalDiscountFromReductions > 100 ? 100 : totalDiscountFromReductions;
  const netCharges = price - (price * totalDiscountFromReductions) / 100;
  const vatAmount = (netCharges * vat) / 100;
  const totalCharges = netCharges + vatAmount;

  return totalCharges;
};

export { totalAmount };
