import fs from 'fs';
import { YamlParser } from '../lib/YamlParser';
import { FeatureFlags } from '../lib/FeatureFlags';

/**
 * @class  CronFeatureFlagsReader
 */
export class CronFeatureFlagsReader {
  /**
   * @summary Reads and proceeds to set all feature flags
   * @returns {Promise<void>}
   */
  public static readAll(): void {
    const rawData = fs.readFileSync(`${__dirname}/cron_flags.yaml`, 'utf-8');
    const parser: YamlParser = new YamlParser(rawData);

    const { cronFlags } = parser.getParsedContent() || [];

    if (!cronFlags || !Object.keys(cronFlags).length) {
      throw new Error(
        "There aren't any cron flags. Please assure that all of them are present in the file."
      );
    }

    return cronFlags;
  }
}
