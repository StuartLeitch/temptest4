import {print} from 'gluegun';

// import chalk from 'chalk'
import {default as asciify} from 'asciify-image';
import clear from 'clear';
import figlet from 'figlet';

module.exports = async () => {
  const {
    info,
    // divider,
    newline,
    colors: {muted}
  } = print;

  const phenomLogoOptions = {
    fit: 'box',
    width: '40%'
    // height: 91
  };

  const asciified: string = await asciify(
    `${__dirname}/../../assets/images/phenom_logo.png`,
    phenomLogoOptions
  );
  clear();
  newline();

  info(asciified);
  newline();
  info(muted(figlet.textSync('Payment CLI', {horizontalLayout: 'full'})));

  newline();
};
