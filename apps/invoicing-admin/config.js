/* eslint-disable @typescript-eslint/no-var-requires */

const { join } = require('path');

const root = join(__dirname);

module.exports = {
  srcDir: join(root, 'src'),
  siteTitle: 'Airframe',
  siteDescription: 'Default Dashboard ready for Development',
  siteCanonicalUrl: 'http://localhost:4200',
  siteKeywords: 'react dashboard seed bootstrap',
  scssIncludes: [],
};
