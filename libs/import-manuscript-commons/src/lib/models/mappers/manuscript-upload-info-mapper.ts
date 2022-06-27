import {GuardFail, GuardFailure, Mapper, UniqueEntityID} from "@hindawi/shared";
import {ManuscriptUploadInfo} from "../manuscript-upload-info";

export class ManuscriptUploadInfoMapper extends Mapper<ManuscriptUploadInfo> {
  /**
   * Convert from the raw db response to the entity
   * @param dbModel
   * {
   *   id: UUID
   *   fileName: string
   *   status: enum
   *   dateCreated: date
   *   dateUpdated: date
   * }
   */
  public static toDomain(dbModel: any): ManuscriptUploadInfo{
      if(dbModel) {
        const uniqueEntityID = new UniqueEntityID(dbModel.id);

        return ManuscriptUploadInfo.create(
          {
            fileName: dbModel?.fileName.toString(),
            status: dbModel?.status.toString(),
            dateCreated: dbModel.dateCreated ? new Date(dbModel.dateCreated) : null,
            dateUpdated: dbModel.dateUpdated ? new Date(dbModel.dateUpdated) : null,
          }
          , uniqueEntityID)
      } else {
        throw new GuardFail("dbmodel is null");
      }
  }

    public static toPersistence(manuscriptUploadInfo: ManuscriptUploadInfo): any{
      return {
        id: manuscriptUploadInfo.id.toString(),
        fileName: manuscriptUploadInfo.fileName,
        status: manuscriptUploadInfo.status,
        dateCreated: manuscriptUploadInfo.dateCreated,
        dateUpdated: manuscriptUploadInfo.dateUpdated
      }
    }
}
