import {GluegunToolbox} from 'gluegun';

module.exports = {
  dashed: true,
  alias: ['h'],
  description: 'Displays Hindawi CLI help',
  run: async (toolbox: GluegunToolbox) => {
    const {
      print: {
        printCommands,
        info,
        newline,
        colors: {magenta}
      }
    } = toolbox;

    newline();
    await require('../brand/header')(); // eslint-disable-line
    printCommands(toolbox);
    newline();
    info(magenta('If you need additional help, give us a call!'));
    newline();

    process.exit();
  }
};
