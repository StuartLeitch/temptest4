import {
  readFileSync,
  statSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  unlinkSync
} from 'fs';
import path from 'path';
import { ResumeService } from '../../resume';

export class FileResumeService implements ResumeService {
  public static filename = 'resume-last-key';
  private filePath;

  constructor(dir: string) {
    this.filePath = path.join(dir, FileResumeService.filename);

    if (!existsSync(dir)) {
      mkdirSync(dir);
    }
    try {
      // creates file if not exists
      statSync(this.filePath);
    } catch (error) {
      writeFileSync(this.filePath, '');
    }
  }
  async clear(): Promise<void> {
    try {
      unlinkSync(this.filePath);
    } catch (e) {}
  }

  async saveKey(s: string): Promise<unknown> {
    writeFileSync(this.filePath, s);
    return;
  }

  async getLastKey(): Promise<string> {
    const key = readFileSync(this.filePath, 'utf8');
    return key.trim();
  }
}
