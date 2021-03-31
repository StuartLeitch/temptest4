// const runtime = {
//   start: new Date(),
//   end: new Date()
// };

export const kill = (arg: unknown): void => {
  console.info(arg);
  process.exit(0);
};

export const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const logWithTime = (val, runtime?) => {
  if (runtime && val === 'START') {
    runtime.start = new Date();
  }
  if (runtime && val === 'END') {
    runtime.end = new Date();
  }

  console.log(new Date().toJSON().substr(11, 12), val);
}

export const runtimeCost = (runtime) => {
  const diff = runtime.end.getTime() - runtime.start.getTime();

  let msec = diff;
  const hh = Math.floor(msec / 1000 / 60 / 60);
  msec -= hh * 1000 * 60 * 60;
  const mm = Math.floor(msec / 1000 / 60);
  msec -= mm * 1000 * 60;
  const ss = Math.floor(msec / 1000);
  msec -= ss * 1000;

  console.info(`${hh} hours : ${mm} minutes : ${ss} seconds`);
}
