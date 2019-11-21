const { SES } = require('aws-sdk');

module.exports = {
  transport: {
    SES: new SES({
      secretAccessKey: process.env.AWS_SES_SECRET_KEY,
      accessKeyId: process.env.AWS_SES_ACCESS_KEY,
      region: process.env.AWS_SES_REGION
    })
  }
};
