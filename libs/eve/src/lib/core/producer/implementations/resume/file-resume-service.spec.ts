import fs from 'fs';
import path from 'path';

const { unlink } = fs.promises;

import { FileResumeService } from './file-resume-service';

const testDir = '/tmp';

describe('File resume service', () => {
  const file = path.join(testDir, FileResumeService.filename);

  afterEach(async () => {
    await unlink(file);
  });

  it('return empty string on first call', async () => {
    let resumeService = new FileResumeService(testDir);
    expect(await resumeService.getLastKey()).toBe('');
  });

  it('returns correctly after setting key', async () => {
    let resumeService = new FileResumeService(testDir);
    resumeService.saveKey('123');
    expect(await resumeService.getLastKey()).toBe('123');
    resumeService.saveKey('420');
    expect(await resumeService.getLastKey()).toBe('420');
  });

  it('returns correctly after multiple services change the key', async () => {
    new FileResumeService(testDir).saveKey('123');
    new FileResumeService(testDir).saveKey('420');
    expect(await new FileResumeService(testDir).getLastKey()).toBe('420');
  });
});
