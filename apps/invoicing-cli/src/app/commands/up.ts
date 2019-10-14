import {GluegunToolbox} from 'gluegun';

import * as shell from 'shelljs';

module.exports = {
  name: 'up',
  description:
    'Build a Docker container: Amazon Simple Queue Service (Amazon SQS) local.',
  run: async (toolbox: GluegunToolbox) => {
    const {
      print: {info}
    } = toolbox;

    info('Docker up');
    shell.exec(
      'docker-compose --file apps/invoicing-cli/docker-compose.yml up'
    );
  }
};
