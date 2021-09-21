import { Context } from '../../builders';
import { EventHandler } from '../event-handler';

const ERP_PAYMENT_REGISTRATION = Symbol('ERPPaymentRegistration');

export const ERPPaymentRegistration: EventHandler<any> = {
  event: String(ERP_PAYMENT_REGISTRATION),
  handler(context: Context) {
    return async (data: any): Promise<void> => {
      const {
        services: { logger },
      } = context;

      logger.setScope(`ERP payment registration event: ${String(ERP_PAYMENT_REGISTRATION)}`);
      logger.info('DO nothing yet!');
      // logger.info(`Incoming Event Data`, data);
    };
  },
};
