import Knex from 'knex';

import { ManuscriptUploadInfo } from '../../models/manuscriptUploadInfo';
import { ManuscriptUploadInfoRepoContract } from '../contracts/manuscriptUploadInfoRepoContract';
import { ManuscriptUploadInfoMapper } from '../../mappers/manuscriptInfoMapper';
import { RepoError } from '../../../../../shared/src/lib/infrastructure/RepoError';

export enum TABLES {
  IMPORTED_MANUSCRIPTS = 'imported_manuscripts',
}

export class ManuscriptUploadInfoRepo
  implements ManuscriptUploadInfoRepoContract
{
  constructor(protected db: Knex) {}

  public async manuscriptExistsByName(packageName: string): Promise<boolean> {
    const sql = this.db(TABLES.IMPORTED_MANUSCRIPTS)
      .count('id as idcount')
      .where('fileName', packageName);
    const sqlResult = await sql;
    const manuscriptCount = sqlResult[0]['idcount'];
    return manuscriptCount > 0;
  }

  public async persistManuscriptInfo(
    manuscriptInfo: ManuscriptUploadInfo
  ): Promise<void> {
    const dbModel = ManuscriptUploadInfoMapper.toPersistence(manuscriptInfo);
    try {
      await this.db(TABLES.IMPORTED_MANUSCRIPTS).insert(dbModel);
    } catch (error) {
      throw RepoError.fromDBError(error);
    }
  }
}
