import { PayPalRequest } from './request';

export interface Response<T> {
  statusCode: string;
  headers: Record<string, unknown>;
  result: T;
}

interface AccessToken {
  isExpired(): boolean;
  authorizationString(): string;
}

export interface PayPalHttpClient {
  getUserAgent(): string;
  execute<T>(request: PayPalRequest): Promise<Response<T>>;
  fetchAccessToken(): Promise<Response<AccessToken>>;
  getTimeout(): number;
}
