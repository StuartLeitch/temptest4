import { createAsyncAction } from "typesafe-actions";

import {
  Invoice,
  Payer,
  InvoiceVATDTO,
  InvoiceVat,
  InvoicesPagination,
  ApplyCouponDTO,
  Coupon,
} from "./types";

export const getInvoice = createAsyncAction(
  "invoice/GET_REQUEST",
  "invoice/GET_SUCCESS",
  "invoice/GET_ERROR",
)<string, Invoice, string>();

export const updatePayerAsync = createAsyncAction(
  "invoice/UPDATE_PAYER_REQUEST",
  "invoice/UPDATE_PAYER_SUCCESS",
  "invoice/UPDATE_PAYER_ERROR",
)<Payer, Payer, string>();

export const getInvoices = createAsyncAction(
  "invoice/FETCH_INVOICES_REQUEST",
  "invoice/FETCH_INVOICES_SUCCESS",
  "invoice/FETCH_INVOICES_ERROR",
)<InvoicesPagination, { totalCount: number; invoices: Invoice[] }, string>();

export const getInvoiceVat = createAsyncAction(
  "invoice/GET_VAT_REQUEST",
  "invoice/GET_VAT_SUCCESS",
  "invoice/GET_VAT_ERROR",
)<InvoiceVATDTO, InvoiceVat, string>();

export const applyCouponAction = createAsyncAction(
  "invoice/APPLY_COUPON_REQUEST",
  "invoice/APPLY_COUPON_SUCCESS",
  "invoice/APPLY_COUPON_ERROR",
)<ApplyCouponDTO, Coupon, string>();
