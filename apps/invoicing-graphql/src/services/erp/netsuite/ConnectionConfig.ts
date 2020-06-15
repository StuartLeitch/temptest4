export class ConnectionConfig {
  private account = '';
  private endpoint = '';
  private consumerKey = '';
  private consumerSecret = '';
  private tokenId = '';
  private tokenSecret = '';

  constructor(options: any) {
    Object.assign(
      this,
      { ...options },
      {
        endpoint: options.endpoint.replace(
          '{NETSUITE_ACCOUNT}',
          options.account
        ),
      }
    );
  }
}
