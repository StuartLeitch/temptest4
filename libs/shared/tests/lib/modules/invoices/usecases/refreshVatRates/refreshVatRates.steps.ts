// import { expect } from 'chai';
// import { Given, When, Then, BeforeAll } from 'cucumber';

// import format from 'date-fns/format';
// import parseISO from 'date-fns/parseISO';

// // import {Result} from '../../src/lib/core/logic/Result';
// // import {UniqueEntityID} from '../../lib/core/domain/UniqueEntityID';

// import {
//   RefreshVATRatesContext,
//   RefreshVATRatesUsecase,
// } from '../../../../../../src/lib/modules/invoices/usecases/refreshVatRates/refreshVatRates';
// // import {ValidateVATErrors} from './../../src/lib/modules/invoices/usecases/validateVAT/validateVATErrors';
// import { VATService } from '../../../../../../src/lib/domain/services/VATService';

// import { Roles } from '../../../../../../src/lib/modules/users/domain/enums/Roles';

// const defaultContext: RefreshVATRatesContext = { roles: [Roles.SUPER_ADMIN] };

// const vatService: VATService = new VATService();
// const refreshVATRatesUsecase = new RefreshVATRatesUsecase(vatService);
// const countryCode = 'RO';
// let result: any;
// let vatRatesResponse: any;

// Given('The Admin is logged in', () => {
//   return;
// });

// When('The Admin refresh the vat rates', async () => {
//   result = await refreshVATRatesUsecase.execute(
//     {
//       countryCode,
//     },
//     defaultContext
//   );
//   console.log(vatRatesResponse);
//   vatRatesResponse = result.value.getValue();
// });

// Then('The new VAT rates should be available', async () => {
//   const rates = vatRatesResponse;
//   rates.forEach((rate) => {
//     const {
//       name,
//       periods: [{ effective_from, rates }],
//     } = rate;

//     console.log(
//       `For ${name}, effective from ${format(
//         parseISO(effective_from),
//         'dd MMM yyyy'
//       )}:
// - the standard VAT rate is: ${rates.standard}
// - the reduced VAT rate is: ${rates.reduced || rates.reduced1 || 0}`
//     );
//   });
// });
