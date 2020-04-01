/**
 * ResumeService is used to remember the last key the producer read/sent.
 */
export interface ResumeService {
  saveKey(s: string): Promise<unknown>;
  getLastKey(): Promise<string>;
  clear(): Promise<void>;
}
