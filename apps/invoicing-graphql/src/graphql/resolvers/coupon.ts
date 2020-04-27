import { Roles } from '@hindawi/shared';

import { Resolvers } from '../schema';

import { GetRecentCouponsUsecase } from './../../../../../libs/shared/src/lib/modules/coupons/usecases/getRecentCoupons/getRecentCoupons';

import { CouponMap } from './../../../../../libs/shared/src/lib/modules/coupons/mappers/CouponMap';

export const coupon: Resolvers<any> = {
  Query: {
    async coupons(parent, args, context) {
      const { repos } = context;
      const usecase = new GetRecentCouponsUsecase(repos.coupon);
      const usecaseContext = {
        roles: [Roles.ADMIN],
      };

      const result = await usecase.execute(args, usecaseContext);
      if (result.isLeft()) {
        return undefined;
      }

      const couponsList = result.value.getValue();

      return {
        totalCount: couponsList.totalCount,
        coupons: couponsList.coupons.map((couponDetails) => ({
          ...CouponMap.toPersistence(couponDetails),
          couponId: couponDetails.id.toString(),
        })),
      };

      // return {
      //   totalCount: invoicesList.totalCount,
      //   invoices: invoicesList.invoices.map((invoiceDetails) => ({
      //     ...InvoiceMap.toPersistence(invoiceDetails),
      //     invoiceId: invoiceDetails.id.toString(),
      //     // status: invoiceDetails.status,
      //     // charge: invoiceDetails.charge,
      //     dateCreated: invoiceDetails?.dateCreated?.toISOString(),
      //     dateAccepted: invoiceDetails?.dateAccepted?.toISOString(),
      //     dateIssued: invoiceDetails?.dateIssued?.toISOString(),
      //     referenceNumber:
      //       invoiceDetails.invoiceNumber && invoiceDetails.dateAccepted
      //         ? invoiceDetails.referenceNumber
      //         : null,
      //   })),
      // };
    },
  },
};
