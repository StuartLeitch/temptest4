/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import {
  Roles,
  GetCouponDetailsByCodeDTO,
  UpdateCouponUsecase,
  GetRecentCouponsUsecase,
  GetCouponDetailsByCodeUsecase,
  CouponMap,
} from '@hindawi/shared';

import { Resolvers } from '../schema';

export const coupon: Resolvers<any> = {
  Query: {
    async coupon(parent, args, context) {
      const { repos } = context;
      const usecase = new GetCouponDetailsByCodeUsecase(repos.coupon);

      const request: GetCouponDetailsByCodeDTO = {
        couponCode: args.couponCode,
      };

      const usecaseContext = {
        roles: [Roles.ADMIN],
      };

      const result = await usecase.execute(request, usecaseContext);

      if (result.isLeft()) {
        throw new Error(result.value.errorValue().message);
      }

      return CouponMap.toPersistence(result.value.getValue());
    },

    async coupons(parent, args, context) {
      const { repos } = context;
      const usecase = new GetRecentCouponsUsecase(repos.coupon);

      const usecaseContext = {
        roles: [Roles.ADMIN],
      };

      const result = await usecase.execute(args, usecaseContext);
      if (result.isLeft()) {
        throw new Error(result.value.errorValue().message);
      }

      const couponsList = result.value.getValue();

      return {
        totalCount: couponsList.totalCount,
        coupons: couponsList.coupons.map(CouponMap.toPersistence),
      };
    },
  },
  Mutation: {
    async updateCoupon(parent, args, context) {
      const {
        repos: { coupon: couponRepo },
      } = context;

      const updateCouponUsecase = new UpdateCouponUsecase(couponRepo);

      const result = await updateCouponUsecase.execute({ ...args.coupon });

      if (result.isLeft()) {
        throw new Error(result.value.errorValue().message);
      }

      return CouponMap.toPersistence(result.value.getValue());
    },
  },
};
