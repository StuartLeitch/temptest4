import path from 'path';
import fs from 'fs';
import gm from 'gm';
import tempy from 'tempy';
import { matcherHint, matcherErrorMessage, RECEIVED_COLOR, DIM_COLOR, printDiffOrStringify } from 'jest-matcher-utils';

function compare(a: string, b:string): Promise<number> {
  return new Promise((resolve, reject) => {
    gm.compare(a, b, (err, isEqual, equality) => {
      if (err) {
        return reject(err);
      }

      resolve(equality);
    });
  });
}

const PRECISION = 100000;

async function toMatchPdf(received, name: string, tolerance: number = 0) {
  const snapshotDir = path.join(
    path.dirname(this.testPath),
    '__snapshots__'
  );
  const snapshotFile = path.join(snapshotDir, `${name}.snap.pdf`);
  const actualFile = tempy.file({ name: `${name}.actual.pdf` });


  if (!fs.existsSync(snapshotFile)) {
    fs.writeFileSync(snapshotFile, received);
    console.log(DIM_COLOR(`PDF Snapshot updated: ${snapshotFile}`));
    return {
      message: (...args) => {
        console.log(args);
        return "asdf";
      },
      report: () => "report",
      pass: true,
    };
  }

  fs.writeFileSync(actualFile, received);

  let equality = await compare(actualFile, snapshotFile);
  const matcherName='toMatchPdf';
  equality = Math.round(equality * 100 * PRECISION) / PRECISION;

  if (equality <= tolerance) {
    fs.unlinkSync(actualFile);
    return {
      message: () =>
        matcherHint(matcherName, actualFile, snapshotFile, { comment: "foo" }),
      pass: true,
    };
  }

  return {
    message: () =>
      matcherErrorMessage(
         matcherHint(matcherName, actualFile, snapshotFile),
        `The received pdf doesn't match the snapshot.`,
        printDiffOrStringify(tolerance, equality, 'Expected difference (%)', 'Actual difference (%)', true) +
        `\n\n${DIM_COLOR('If you want to update the snapshot remove it and re-run tests.')}`+
        `\n\n${DIM_COLOR('The actual file was not removed, you can inspect it: ')} \n\n` +
        RECEIVED_COLOR(actualFile)
      ),
    pass: false
  };
}

expect.extend({ toMatchPdf });
