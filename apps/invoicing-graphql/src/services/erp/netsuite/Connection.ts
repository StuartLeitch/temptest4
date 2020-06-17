/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import crypto from 'crypto';
import OAuth from 'oauth-1.0a';

export class Connection {
  public config: any;
  public oauth: any;
  public token: any;
  public state: string;
  public threadId: any;

  private connectCalled: boolean;

  constructor(options: any) {
    this.config = options.config;

    this.connectCalled = false;
    this.state = 'disconnected';
    this.threadId = null;

    this.setOAuth();
    this.setToken();
  }

  async connect(options: any, callback: any): Promise<any> {
    if (!callback && typeof options === 'function') {
      callback = options;
      options = {};
    }

    if (!this.connectCalled) {
      this.connectCalled = true;
      //   const connection = this;
    }
  }

  async destroy() {
    this.state = 'disconnected';
  }

  private hash_function_sha256(base_string: string, key: string) {
    return crypto
      .createHmac('sha256', key)
      .update(base_string)
      .digest('base64');
  }

  private setOAuth() {
    const { config, hash_function_sha256 } = this;

    this.oauth = new OAuth({
      realm: config.account,
      consumer: {
        key: config.consumerKey,
        secret: config.consumerSecret,
      },
      signature_method: 'HMAC-SHA256',
      parameter_seperator: ',',
      hash_function: hash_function_sha256,
    });
  }

  private setToken() {
    const { config } = this;

    this.token = {
      key: config.tokenId,
      secret: config.tokenSecret,
    };
  }
}
