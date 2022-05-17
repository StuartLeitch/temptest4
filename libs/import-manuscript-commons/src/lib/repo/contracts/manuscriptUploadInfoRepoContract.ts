export interface ManuscriptUploadInfoRepoContract {
  manuscriptExistsByName(packageName: string): Promise<boolean>;
}
