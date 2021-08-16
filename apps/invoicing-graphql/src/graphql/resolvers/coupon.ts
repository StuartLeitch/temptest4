import {
  GetCouponDetailsByCodeUsecase,
  GenerateCouponCodeUsecase,
  GetCouponDetailsByCodeDTO,
  GetRecentCouponsUsecase,
  CreateCouponUsecase,
  GetRecentCouponsDTO,
  UpdateCouponUsecase,
  CreateCouponDTO,
  CouponMap,
} from '@hindawi/shared';

import { Context } from '../../builders';

import { Resolvers } from '../schema';

import { handleForbiddenUsecase, getAuthRoles } from './utils';

export const coupon: Resolvers<Context> = {
  Query: {
    async coupon(parent, args, context) {
      const roles = getAuthRoles(context);
      const { repos } = context;
      const usecase = new GetCouponDetailsByCodeUsecase(repos.coupon);

      const request: GetCouponDetailsByCodeDTO = {
        couponCode: args.couponCode,
      };

      const usecaseContext = {
        roles,
      };

      const result = await usecase.execute(request, usecaseContext);

      handleForbiddenUsecase(result);

      if (result.isLeft()) {
        throw new Error(result.value.message);
      }

      return CouponMap.toPersistence(result.value);
    },
    async coupons(parent, args: GetRecentCouponsDTO, context) {
      const roles = getAuthRoles(context);
      const { repos } = context;
      const usecase = new GetRecentCouponsUsecase(repos.coupon);

      const usecaseContext = {
        roles,
      };

      const result = await usecase.execute(args, usecaseContext);

      handleForbiddenUsecase(result);

      if (result.isLeft()) {
        throw new Error(result.value.message);
      }

      const couponsList = result.value;

      return {
        totalCount: +couponsList.totalCount,
        coupons: couponsList.coupons.map(CouponMap.toPersistence),
      };
    },
    async generateCouponCode(parent, args, context) {
      const roles = getAuthRoles(context);

      const { repos } = context;
      const usecase = new GenerateCouponCodeUsecase(repos.coupon);

      const usecaseContext = { roles };

      const result = await usecase.execute(null, usecaseContext);
      if (result.isLeft()) {
        throw new Error(result.value.message);
      }

      handleForbiddenUsecase(result);

      const code = result.value.value;
      return { code };
    },
  },
  Mutation: {
    async createCoupon(parent, args, context) {
      const roles = getAuthRoles(context);
      const userData = (context.keycloakAuth.accessToken as any)?.content;

      const {
        repos: { coupon: couponRepo },
        auditLoggerService
      } = context;

      auditLoggerService.setUserData(userData);
      const createCouponUsecase = new CreateCouponUsecase(couponRepo, auditLoggerService);

      const usecaseContext = {
        roles,
      };

      const rawCoupon = args.coupon;

      const usecaseArgs: CreateCouponDTO = {
        invoiceItemType: rawCoupon.invoiceItemType,
        expirationDate: rawCoupon.expirationDate,
        reduction: rawCoupon.reduction,
        status: rawCoupon.status,
        code: rawCoupon.code,
        name: rawCoupon.name,
        type: rawCoupon.type,
      };

      const result = await createCouponUsecase.execute(
        usecaseArgs,
        usecaseContext
      );

      handleForbiddenUsecase(result);

      if (result.isLeft()) {
        throw new Error(result?.value?.message);
      }

      return CouponMap.toPersistence(result.value);
    },
    async updateCoupon(parent, args, context) {
      const roles = getAuthRoles(context);

      const {
        repos: { coupon: couponRepo },
      } = context;

      const updateCouponUsecase = new UpdateCouponUsecase(couponRepo);

      const usecaseContext = {
        roles,
      };

      const result = await updateCouponUsecase.execute(
        args.coupon,
        usecaseContext
      );

      handleForbiddenUsecase(result);

      if (result.isLeft()) {
        throw new Error(result.value.message);
      }

      return CouponMap.toPersistence(result.value);
    },
  },
};
