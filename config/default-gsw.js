/* eslint-disable max-len */

const gswConfig = {
  mailer: {
    path: `${__dirname}/mailer`,
  },
  journal: {
    logo: 'https://invoicing.lithosphere.geoscienceworld.org/assets/gsw/images/Lithosphere_logo_web.png',
    ctaColor: '#63a945',
    logoLink: 'https://pubs.geoscienceworld.org/',
    privacy:
      'This email was sent to [TO EMAIL]. You have received this email in regards to the account creation, submission, or peer review process of a paper submitted to Lithosphere, published by GeoScienceWorld and supported by our publishing partner, Hindawi Limited.<br/>GeoScienceWorld respects your right to privacy. Please see <a style="color: #007e92; text-decoration: none;" href="https://pubs.geoscienceworld.org/pages/privacy-policy">our privacy policy</a> for information on how we store, process, and safeguard your data. <br /> GeoScienceWorld, a nonprofit corporation conducting business in the Commonwealth of Virginia at 1750 Tysons Boulevard, Suite 1500, McLean, Virginia 22102.<br /></br />Hindawi respects your right to privacy. Please see our <a style="color: #007e92; text-decoration: none;" href="https://www.hindawi.com/privacy/">privacy policy</a> for information on how we store, process, and safeguard your data.',
    address: '1750 Tysons Boulevard, Suite 1500, McLean, Virginia 22102',
    publisher: 'GeoScienceWorld',
    footerText: '',
  },
};

module.exports = gswConfig;
