import Knex from "knex";
import {LoggerBuilder, LoggerContract} from "@hindawi/shared";
import {ManuscriptUploadInfoRepoContract} from "../contracts/manuscriptUploadInfoRepoContract";
import {RepoError} from "../../../../../shared/src/lib/infrastructure/RepoError";
import {ManuscriptUploadInfo} from "../../models/manuscript-upload-info";
import {ManuscriptUploadInfoMapper} from "../../models/mappers/manuscript-upload-info-mapper";

export enum TABLES {
  IMPORTED_MANUSCRIPTS = 'imported_manuscripts',
}

export class ManuscriptUploadInfoRepo implements ManuscriptUploadInfoRepoContract {
  private logger: LoggerContract;

  constructor(protected db: Knex) {
    this.logger = new LoggerBuilder("ManuscriptUploadInfoRepo").getLogger()
  }

  public async manuscriptExistsByName(packageName: string): Promise<boolean> {
    const sql = this.db(TABLES.IMPORTED_MANUSCRIPTS)
      .count("id as idcount")
      .where('fileName', packageName);
    const sqlResult =await sql;
    const manuscriptCount = sqlResult[0]['idcount'];
    return manuscriptCount > 0;
  }

  public async persistManuscriptInfo(manuscriptInfo: ManuscriptUploadInfo): Promise<void>{
    const dbModel = ManuscriptUploadInfoMapper.toPersistence(manuscriptInfo);
    try {
      await this.db(TABLES.IMPORTED_MANUSCRIPTS).insert(dbModel);
    }
    catch(error){
      throw RepoError.fromDBError(error)
    }
  }
}
