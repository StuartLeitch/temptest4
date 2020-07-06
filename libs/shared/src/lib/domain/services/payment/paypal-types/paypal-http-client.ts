import { PayPalRequest } from './request';

export interface PayPalHttpClient {
  getUserAgent(): string;
  execute(request: PayPalRequest): Promise<any>;
  fetchAccessToken(): Promise<any>;
  getTimeout(): number;
}
