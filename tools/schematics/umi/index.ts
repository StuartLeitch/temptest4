// import {JsonObject} from '@angular-devkit/core';
import {chain, externalSchematic, Rule} from '@angular-devkit/schematics';
// import {
//   addDepsToPackageJson,
//   // addPackageWithInit,
//   updateWorkspace
// } from '@nrwl/workspace';
// import {
//   antdVersion,
//   dvaVersion,
//   umiPluginReact,
//   umiTypes,
//   umiVersion
// } from './src/utils/versions';

// export function addDependencies(): Rule {
//   return addDepsToPackageJson(
//     {
//       antd: antdVersion,
//       dva: dvaVersion,
//       umi: umiVersion,
//       'umi-plugin-react': umiPluginReact,
//       'umi-types': umiTypes
//     },
//     {}
//   );
// }

// function setDefault(): Rule {
//   return updateWorkspace(workspace => {
//     // Set workspace default collection to 'react' if not already set.
//     workspace.extensions.cli = workspace.extensions.cli || {};
//     const defaultCollection: string =
//       workspace.extensions.cli &&
//       ((workspace.extensions.cli as JsonObject).defaultCollection as string);

//     if (!defaultCollection || defaultCollection === '@nrwl/workspace') {
//       (workspace.extensions.cli as JsonObject).defaultCollection = '@umi';
//     }
//   });
// }

export default function(schema: any): Rule {
  return chain([
    externalSchematic('@nrwl/react', 'app', {
      name: schema.name
    })
  ]);
}
