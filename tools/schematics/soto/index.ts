import {chain, externalSchematic, Rule} from '@angular-devkit/schematics';

export default function(schema: any): Rule {
  return chain([
    externalSchematic('@nrwl/react', 'app', {
      name: schema.name
    })
  ]);
}
