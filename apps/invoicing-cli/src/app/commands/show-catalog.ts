import {GluegunToolbox} from 'gluegun';

import {
  // AddCatalogItemToCatalogUseCase,
  GetAllCatalogItemsUseCase,
  makeDb,
  destroyDb,
  KnexCatalogRepo as CatalogRepo
} from '@hindawi/shared';

module.exports = {
  dashed: true,
  name: 'show-catalog',
  alias: ['sc'],
  description: 'Show Finance Product types Catalog',
  run: async (toolbox: GluegunToolbox) => {
    // retrieve the tools from the toolbox that we will need
    const {
      // parameters,
      print: {
        spin,
        // debug,
        // success,
        newline,
        table,
        info,
        error,
        colors: {blue}
      }
      //   prompt,
      //   createTransactionFlow
    } = toolbox;

    info(blue('************************'));
    info(blue('*     Show Catalog     *'));
    info(blue('************************'));
    newline();

    const db = await makeDb({filename: './dev.sqlite3'});
    const catalogRepo = new CatalogRepo(db);

    // * create spinner
    const spinner = spin();
    spinner.color = 'cyan';

    // const addCatalogItemToCatalogUseCase = new AddCatalogItemToCatalogUseCase(
    //   catalogRepo
    // );

    // spinner.start('Execute addCatalogItemToCatalogUseCase');
    // const result = await addCatalogItemToCatalogUseCase.execute({
    //   type: 'APC',
    //   price: 1900
    // });

    // if (result.isSuccess) {
    //   const newlyCreatedCatalogItem = result.getValue();
    //   spinner.succeed('Successfully created a CatalogItem.');
    //   success(newlyCreatedCatalogItem);
    // } else {
    //   const {error: usecaseError} = result;
    //   spinner.fail(usecaseError.toString());
    //   error(usecaseError);
    // }

    const getAllCatalogItemsUseCase = new GetAllCatalogItemsUseCase(
      catalogRepo
    );

    spinner.start('Execute getAllCatalogItemsUseCase');
    const result = await getAllCatalogItemsUseCase.execute({});
    spinner.stop();

    if (result.isSuccess) {
      const catalog = result.getValue();
      // debug(catalog)
      const tableColumns = ['Type', 'Price'];
      // spinner.succeed('Successfully created a CatalogItem.')
      // success(newlyCreatedCatalogItem)
      const tableData = catalog.map(ci => [ci.type, ci.price]);
      tableData.unshift(tableColumns);
      table(tableData, {
        format: 'lean'
      });
    } else {
      const {error: usecaseError} = result;
      spinner.fail(usecaseError.toString());
      error(usecaseError);
    }

    await destroyDb(db);
    process.exit();
  }
};
