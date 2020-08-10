import { PayPalLinkDescription } from '../link-description';

export interface PayPalWebhookResponse<T> {
  id: string;
  event_version: string;
  create_time: string;
  resource_type: string;
  resource_version: string;
  event_type: string;
  summary: string;
  resource: T;
  links: Array<PayPalLinkDescription>;
}
