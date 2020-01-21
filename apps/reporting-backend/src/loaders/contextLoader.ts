import {
  MicroframeworkLoader,
  MicroframeworkSettings
} from 'microframework-w3tec';
export const contextLoader: MicroframeworkLoader = (
  settings: MicroframeworkSettings | undefined
) => {
  if (settings) {
    const db = settings.getData('connection');

    const repos = {};

    const services = {};

    const context = {
      repos,
      services
    };

    settings.setData('context', context);
  }
};
