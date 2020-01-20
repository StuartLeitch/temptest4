import { S3 } from 'aws-sdk';

export class S3Bucket {
  private _logger;
  private _api;
  private _credentials;
  private _endpoint;
  private _apiVersion;
  private _name;

  constructor(params) {
    this.configure(params);
  }

  getObjects(params, callback) {
    const withCallback = callback != null;

    const _params = withCallback
      ? this._makeParams(params)
      : this._makeParams();
    const cb = withCallback ? callback : params;

    this._listObjects(_params, (err, list) => {
      if (err != null) {
        this.logger.error(err); // TODO: use tags (for debugging)
        return;
      }

      for (const { Key } of list.Contents) {
        this._getObject({ ..._params, Key }, (err, object) => {
          if (err != null) {
            this.logger.error(err); // TODO: use tags (for debugging)
            return;
          }

          let data;
          try {
            data = object.Body.toString();
          } catch {
            this.logger.error('[AWS] Object data cannot be decoded:', object);
          }

          this._processData(data, cb);
        });
      }
    });
  }

  _listObjects(params, cb) {
    return this.backend.listObjectsV2(params, cb);
  }

  _getObject(params, cb) {
    return this.backend.getObject(params, cb);
  }

  _processData(data, cb) {
    if (data == null) return;

    for (const entry of data.trim().split(/\s*[\r\n]+\s*/g)) {
      let json;
      try {
        json = JSON.parse(entry.trim());
      } catch {
        this.logger.error(
          '[AWS] Object data cannot be JSON deserialized:',
          entry.trim()
        );
      }

      if (json != null) {
        cb(json);
      }
    }
  }

  get logger() {
    if (this._logger == null) {
      this._logger = console;
    }

    return this._logger;
  }

  get backend() {
    if (this._api == null) {
      this._api = new S3({
        ...this._credentials,
        endpoint: this._endpoint,
        apiVersion: this._apiVersion
      });
    }

    return this._api;
  }

  get name() {
    return this._name;
  }

  get credentials() {
    return this._credentials;
  }

  get apiVersion() {
    return this._apiVersion;
  }

  get endpoint() {
    return this._endpoint;
  }

  _makeParams(params: any = {}) {
    if (typeof params === 'string') return { Bucket: params };

    if (params.Bucket == null) return { ...params, Bucket: this._name };

    return params;
  }

  configure(params) {
    if (params == null) return false;

    if (params.endpoint != null) {
      this._endpoint = params.endpoint;
    }

    if (params.name != null) {
      this._name = params.name;
    }

    if (params.apiVersion != null) {
      this._apiVersion = params.apiVersion;
    }

    if (params.credentials != null) {
      this._credentials = params.credentials;
    }

    if (params.logger != null) {
      this._logger = params.logger;
    }

    return true;
  }
}
