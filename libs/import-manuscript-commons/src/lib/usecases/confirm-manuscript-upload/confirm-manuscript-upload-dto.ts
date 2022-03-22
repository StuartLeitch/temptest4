export interface ConfirmManuscriptUploadDTO {
  fileName: string;
  senderEmail: string;
  receiver: {
    name: string;
    email: string;
  }
}
