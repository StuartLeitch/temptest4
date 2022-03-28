import {ManuscriptUploadInfo} from "../../models/manuscriptUploadInfo";

export interface ManuscriptUploadInfoRepoContract {
  manuscriptExistsByName(packageName: string): Promise<boolean>;
}
