export const UPLOAD_FILE_MUTATION = `
    mutation confirmS3Upload (
       $confirmation: ConfirmS3UploadArgs!
    ) {
        confirmS3Upload(
            confirmation: $confirmation
        )
    }
`;
