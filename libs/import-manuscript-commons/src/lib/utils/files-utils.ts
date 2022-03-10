import { access } from 'fs/promises';

import { Path } from '../models';

export async function isFileAccessible(path: Path): Promise<boolean> {
  try {
    await access(path.src);
    return true;
  } catch (err) {
    return false;
  }
}
