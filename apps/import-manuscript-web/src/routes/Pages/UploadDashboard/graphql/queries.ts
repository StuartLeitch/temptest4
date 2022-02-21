export const UPLOAD_FILE_QUERY = `
    query createSignedUrl($fileName: String!) {
        createSignedUrlForS3Upload(
            fileName: $fileName
        )
    }
`;
