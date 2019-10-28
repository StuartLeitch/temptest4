const {SES} = require('aws-sdk');

module.exports = {
  transport: {
    SES: new SES({
      secretAccessKey: '/0Eol8v4kuojmqKp4hpqL5qeLaZ3oAFlCG+pj1O4',
      accessKeyId: 'AKIAIGOL6SNQYTP2HWNA',
      region: 'eu-west-1'
    })
  }
};
