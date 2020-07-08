import { Command } from './app/contracts';
import { BuildManifestsCommand } from './app/commands/build-manifests';

const commandMap: { [key: string]: Command } = {};
commandMap['build-manifests'] = new BuildManifestsCommand();

async function run() {
  const commandToRun: Command = commandMap[process.env.COMMAND];
  if (!commandToRun) {
    console.error('Command not found');
    process.exit(127);
  }

  try {
    await commandToRun.run();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);
}

run();
