import http from 'http';
import { Consumer } from '../../consumer';

export class HttpPublishConsumer<T> implements Consumer<T> {
  constructor(private host: string) {}

  async consume(objects: T | T[]): Promise<void> {
    const events = [].concat(objects);

    try {
      await this.sendEvent(events);
      console.log('ok');
    } catch (error) {
      console.log(error);
    }
  }

  private async sendEvent(data: any[]): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(data);
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };
      const req = http.request(this.host, options, res => {
        if (res.statusCode >= 400) {
          reject('Bad request, status code: ' + res.statusCode);
          return;
        }
        res.on('end', () => {
          resolve();
        });
      });
      req.on('error', e => reject(e));
      req.write(postData);
      req.end();
    });
  }
}
