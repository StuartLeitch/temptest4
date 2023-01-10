import { AuthenticationError, ForbiddenError } from 'apollo-server';

import {UseCaseError, Either, Roles, InvoiceItemId, UniqueEntityID, Coupon, Waiver} from '@hindawi/shared';

import { Context } from '../../builders';

export function handleForbiddenUsecase(result: Either<UseCaseError, unknown>) {
  if (result && result.isLeft() && result.value.message === 'UNAUTHORIZED') {
    throw new ForbiddenError('You must be authorized');
  }
}

export function getAuthRoles(context: Context): Array<Roles> {
  if (!context.keycloakAuth.accessToken) {
    throw new AuthenticationError('You must be logged in!');
  }

  const authRoles = (context.keycloakAuth.accessToken as any).content
    .resource_access['invoicing-admin'].roles;
  const contextRoles = authRoles.map((role) => Roles[role.toUpperCase()]);

  return contextRoles;
}

export function getOptionalAuthRoles(context: Context): Array<Roles> {
  if (!context.keycloakAuth.accessToken) {
    return [Roles.PAYER];
  } else {
    return getAuthRoles(context);
  }
}

export function invoiceChargingDetails(coupons: Coupon[], waivers: Waiver[], price, taDiscount, vat) {
  const reductions = [...coupons, ...waivers];
  let totalDiscountFromReductions = reductions.reduce(
    (acc, curr) => acc + curr.reduction,
    0
  );
  totalDiscountFromReductions =
    totalDiscountFromReductions > 100 ? 100 : totalDiscountFromReductions;
  const netCharges = price - ((price * totalDiscountFromReductions) / 100) - taDiscount;
  const vatAmount = (netCharges * vat) / 100;
  const totalCharges = netCharges + vatAmount;
  return {totalCharges, netCharges, vatAmount};
}

export async function getCouponsAndWaivers(context: Context, invoiceItem) {
  const maybeCouponsAssociation =
    await context.repos.coupon.getCouponsByInvoiceItemId(
      InvoiceItemId.create(new UniqueEntityID(invoiceItem.id))
    );

  if (maybeCouponsAssociation.isLeft()) {
    throw new Error(maybeCouponsAssociation.value.message);
  }

  const coupons = maybeCouponsAssociation.value.map(c => c.coupon);

  const maybeWaivers = (
    await context.repos.waiver.getWaiversByInvoiceItemId(
      InvoiceItemId.create(new UniqueEntityID(invoiceItem.id))
    )
  )

  if (maybeWaivers.isLeft()) {
    throw new Error(maybeWaivers.value.message);
  }

  const waivers = maybeWaivers.value.map(waiver => waiver.waiver);
  return {coupons, waivers};
}
